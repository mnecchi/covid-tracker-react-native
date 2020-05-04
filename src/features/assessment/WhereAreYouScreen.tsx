import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik, FormikProps } from 'formik';
import { cloneDeep } from 'lodash';
import { Form, Icon, Item, Label, Picker, Text, CheckBox } from 'native-base';
import React, { Component } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import * as Yup from 'yup';

import { BigButton } from '../../components/Button';
import { CheckboxItem, CheckboxList } from '../../components/Checkbox';
import DropdownField from '../../components/DropdownField';
import { GenericTextField } from '../../components/GenericTextField';
import ProgressStatus from '../../components/ProgressStatus';
import Screen, { FieldWrapper, Header, ProgressBlock, screenWidth } from '../../components/Screen';
import { BrandedButton, ErrorText, HeaderText } from '../../components/Text';
import { ValidatedTextInput } from '../../components/ValidatedTextInput';
import { ValidationError, ValidationErrors } from '../../components/ValidationError';
import UserService, { isUSCountry } from '../../core/user/UserService';
import { PatientInfosRequest } from '../../core/user/dto/UserAPIContracts';
import i18n from '../../locale/i18n';
import Navigator from '../Navigation';
import { ScreenParamList } from '../ScreenParamList';

type LocationProps = {
  navigation: StackNavigationProp<ScreenParamList, 'WhereAreYou'>;
  route: RouteProp<ScreenParamList, 'WhereAreYou'>;
};

interface WhereAreYouData {
  medicalAdviceSought: string[];
  hospitalStatus: string;
  hospitalAdmission: string;
  hospitalStayLength: string;
}

const initialFormValues = {
  medicalAdviceSought: [] as string[],
  hospitalStatus: '',
  hospitalAdmission: 'no',
  hospitalStayLength: '',
};

type CheckboxData = {
  label: string;
  value: string;
};

export default class WhereAreYouScreen extends Component<LocationProps, object> {
  constructor(props: LocationProps) {
    super(props);
    Navigator.resetNavigation(props.navigation);
  }

  handleUpdate(values: WhereAreYouData) {
    const { currentPatient, assessmentId } = this.props.route.params;
    const location = values.hospitalStatus;
    const promise = this.updateAssessment(location);
    if (['hospital', 'back_from_hospital'].includes(location)) {
      promise
        .then((response) =>
          this.props.navigation.navigate('TreatmentSelection', {
            currentPatient,
            assessmentId,
            location,
          })
        )
        .catch(() => this.setState({ errorMessage: i18n.t('something-went-wrong') }));
    } else {
      promise
        .then((response) => Navigator.gotoEndAssessment())
        .catch(() => this.setState({ errorMessage: i18n.t('something-went-wrong') }));
    }
  }

  private updateAssessment(formData: WhereAreYouData) {
    // TODO: Revisit this once backend fields are defined
    const assessmentId = this.props.route.params.assessmentId;
    const userService = new UserService();

    let infos = {
      location: formData.hospitalStatus,
      // TODO: Create below fields in backend
      admitted_to_hospital: formData.hospitalAdmission === 'yes',
    } as Partial<PatientInfosRequest>;

    if (infos.admitted_to_hospital) {
      infos = {
        ...infos,
        hospital_stay_length: formData.hospitalStayLength,
      };
    }
    const promise = userService.updateAssessment(assessmentId, infos);
    return promise;
  }

  registerSchema = Yup.object().shape({
    // TODO: Add error messages
    medicalAdviceSought: Yup.array<string>().min(1),
    hospitalStatus: Yup.string().required(),
    hospitalAdmission: Yup.string().required(),
    hospitalStayLength: Yup.number().required(),
  });

  render() {
    const currentPatient = this.props.route.params.currentPatient;

    const hospitalStatusCheckboxes = [
      { label: i18n.t('where-are-you.picker-location-home'), value: 'home' },
      { label: i18n.t('where-are-you.picker-location-hospital'), value: 'hospital' },
      { label: i18n.t('where-are-you.picker-location-back-from-hospital'), value: 'back_from_hospital' },
      {
        label: i18n.t('where-are-you.picker-location-back-from-hospital-already-reported'),
        value: 'back_from_hospital',
      },
    ];

    const medicalAdviceCheckboxes = [
      { label: 'Over the phone or by video', value: 'phone_video' },
      { label: 'In person somewhere other than a hospital', value: 'in_person_outside_hospital' },
    ];

    return (
      <Screen profile={currentPatient.profile} navigation={this.props.navigation}>
        <Header>
          <HeaderText>{i18n.t('where-are-you.question-location')}</HeaderText>
        </Header>

        <ProgressBlock>
          <ProgressStatus step={4} maxSteps={5} />
        </ProgressBlock>

        <Formik
          initialValues={initialFormValues}
          validationSchema={this.registerSchema}
          onSubmit={(values: WhereAreYouData) => {
            return this.handleUpdate(values);
          }}>
          {(props) => {
            return (
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FieldWrapper>
                  <Item stackedLabel style={styles.textItemStyle}>
                    <Label>{i18n.t('where-are-you.question-medical-advice')}</Label>
                    <CheckboxList>
                      {medicalAdviceCheckboxes.map((checkBox: CheckboxData) => {
                        return (
                          <CheckboxItem
                            key={checkBox.label}
                            value={props.values.medicalAdviceSought.includes(checkBox.value)}
                            onChange={(checked: boolean) => {
                              let adviceArray = props.values.medicalAdviceSought;
                              if (checked) {
                                adviceArray.push(checkBox.value);
                              } else {
                                adviceArray = adviceArray.filter((val) => val != checkBox.value);
                              }
                              props.setFieldValue('medicalAdviceSought', adviceArray);
                            }}>
                            {checkBox.label}
                          </CheckboxItem>
                        );
                      })}
                    </CheckboxList>
                  </Item>
                </FieldWrapper>
                <FieldWrapper>
                  <Item stackedLabel style={styles.textItemStyle}>
                    <Label>{i18n.t('where-are-you.question-visited-hospital')}</Label>
                    <CheckboxList>
                      {hospitalStatusCheckboxes.map((checkBox: CheckboxData) => {
                        return (
                          <CheckboxItem
                            key={checkBox.label}
                            value={props.values.hospitalStatus == checkBox.value}
                            onChange={(value: boolean) => {
                              props.setFieldValue('hospitalStatus', value ? checkBox.value : '');
                            }}>
                            {checkBox.label}
                          </CheckboxItem>
                        );
                      })}
                    </CheckboxList>
                  </Item>
                </FieldWrapper>

                {props.values.hospitalStatus.includes('back_from_hospital') && (
                  <>
                    <DropdownField
                      selectedValue={props.values.hospitalAdmission}
                      onValueChange={props.handleChange('hospitalAdmission')}
                      label={i18n.t('where-are-you.question-asked-to-stay')}
                    />

                    {props.values.hospitalAdmission === 'yes' && (
                      <>
                        <GenericTextField
                          formikProps={props}
                          label={i18n.t('where-are-you.question-admission-length')}
                          name="hospitalStayLength"
                          keyboardType="numeric"
                        />
                      </>
                    )}
                  </>
                )}

                <BrandedButton onPress={props.handleSubmit}>
                  <Text>{i18n.t('next-question')}</Text>
                </BrandedButton>
              </KeyboardAvoidingView>
            );
          }}
        </Formik>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    marginVertical: 32,
  },

  fieldWrapper: {
    // marginVertical: 32,
  },

  textItemStyle: {
    borderColor: 'transparent',
  },
});
