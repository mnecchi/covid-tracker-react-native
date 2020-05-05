import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik, FormikProps } from 'formik';
import { Form, Text, CheckBox, Label, View } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import * as Yup from 'yup';

import { CheckboxItem, CheckboxList } from '../../components/Checkbox';
import { colors, fontStyles } from '../../../theme';
import { BigButton } from '../../components/Button';
import ProgressStatus from '../../components/ProgressStatus';
import Screen, { FieldWrapper, Header, ProgressBlock } from '../../components/Screen';
import { BrandedButton, CaptionText, HeaderText } from '../../components/Text';
import UserService from '../../core/user/UserService';
import i18n from '../../locale/i18n';
import Navigator from '../Navigation';
import { ScreenParamList } from '../ScreenParamList';
import { t } from 'i18n-js';

type TreatmentSelectionProps = {
  navigation: StackNavigationProp<ScreenParamList, 'TreatmentSelection'>;
  route: RouteProp<ScreenParamList, 'TreatmentSelection'>;
};

interface TreatmentData {
  treatments: string[];
}

const initalFormValues = {
  treatments: [] as string[],
};

type CheckBoxData = {
  label: string;
  value: string;
};

export default class TreatmentSelectionScreen extends Component<TreatmentSelectionProps> {
  constructor(props: TreatmentSelectionProps) {
    super(props);
    Navigator.resetNavigation(props.navigation);
    this.handleTreatment = this.handleTreatment.bind(this);
  }

  handleTreatment(values: TreatmentData) {
    const { currentPatient, assessmentId, location } = this.props.route.params;
    const userService = new UserService();

    // TODO: adjust backend and update below based on question changes.
    // if (values.treatments.includes('other')) {
    //   this.props.navigation.navigate('TreatmentOther', { currentPatient, assessmentId, location });
    // } else {
    //   userService.updateAssessment(assessmentId, { treatment }).then((r) => Navigator.gotoEndAssessment());
    // }
  }

  registerSchema = Yup.object().shape({
    treatments: Yup.array<string>().min(1),
  });

  render() {
    const currentPatient = this.props.route.params.currentPatient;
    const title =
      this.props.route.params.location === 'back_from_hospital'
        ? i18n.t('treatment-selection-title-after')
        : i18n.t('treatment-selection-title-during');

    const treatmentSelectionOptions = [
      { label: i18n.t('treatment-selection-picker-none'), caption: '', value: 'none' },
      {
        label: i18n.t('treatment-selection-picker-oral-medication'),
        caption: i18n.t('treatment-selection-picker-subtext-oral-medication'),
        value: 'oralMedication',
      },
      {
        label: i18n.t('treatment-selection-picker-iv-medication'),
        caption: i18n.t('treatment-selection-picker-subtext-iv-medication'),
        value: 'ivMedication',
      },
      {
        label: i18n.t('treatment-selection-picker-oxygen-only'),
        caption: i18n.t('treatment-selection-picker-subtext-oxygen-only'),
        value: 'oxygenOnly',
      },
      {
        label: i18n.t('treatment-selection-picker-non-invasive-ventilation'),
        caption: i18n.t('treatment-selection-picker-subtext-non-invasive-ventilation'),
        value: 'nonInvasiveVentilation',
      },
      {
        label: i18n.t('treatment-selection-picker-invasive-ventilation'),
        caption: i18n.t('treatment-selection-picker-subtext-invasive-ventilation'),
        value: 'invasiveVentilation',
      },
      { label: i18n.t('treatment-selection-picker-other'), caption: '', value: 'other' },
    ];

    return (
      <Screen profile={currentPatient.profile} navigation={this.props.navigation}>
        <Header>
          <HeaderText>{title}</HeaderText>
        </Header>

        <ProgressBlock>
          <ProgressStatus step={4} maxSteps={5} />
        </ProgressBlock>

        <Formik
          initialValues={initalFormValues}
          validationSchema={this.registerSchema}
          onSubmit={(values: TreatmentData) => {
            return this.handleTreatment(values);
          }}>
          {(props) => {
            return (
              <View>
                <FieldWrapper>
                  <CheckboxList>
                    {treatmentSelectionOptions.map((item) => {
                      return (
                        <CheckboxItem
                          key={item.value}
                          value={props.values.treatments.includes(item.value)}
                          onChange={(checked: boolean) => {
                            let treatmentArray = props.values.treatments;
                            if (item.value == 'none') {
                              treatmentArray = ['none'];
                            } else if (checked) {
                              treatmentArray.push(item.value);
                              treatmentArray = treatmentArray.filter((val) => val !== 'none');
                            } else {
                              treatmentArray = treatmentArray.filter((val) => val !== item.value);
                            }
                            props.setFieldValue('treatments', treatmentArray);
                          }}>
                          {item.label}
                          {item.caption && <CaptionText>{'\n' + item.caption}</CaptionText>}
                        </CheckboxItem>
                      );
                    })}
                  </CheckboxList>
                </FieldWrapper>

                <BrandedButton onPress={props.handleSubmit}>
                  <Text>{i18n.t('next-question')}</Text>
                </BrandedButton>
              </View>
            );
          }}
        </Formik>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    marginVertical: 24,
  },

  fieldWrapper: {
    marginVertical: 8,
  },

  indentedText: {
    marginHorizontal: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
