import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Form, Text } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import { colors, fontStyles } from '../../../theme';
import { BigButton } from '../../components/Button';
import ProgressStatus from '../../components/ProgressStatus';
import Screen, { FieldWrapper, Header, ProgressBlock } from '../../components/Screen';
import { CaptionText, HeaderText } from '../../components/Text';
import UserService from '../../core/user/UserService';
import i18n from '../../locale/i18n';
import Navigator from '../Navigation';
import { ScreenParamList } from '../ScreenParamList';

type TreatmentSelectionProps = {
  navigation: StackNavigationProp<ScreenParamList, 'TreatmentSelection'>;
  route: RouteProp<ScreenParamList, 'TreatmentSelection'>;
};

export default class TreatmentSelectionScreen extends Component<TreatmentSelectionProps> {
  constructor(props: TreatmentSelectionProps) {
    super(props);
    Navigator.resetNavigation(props.navigation);
    this.handleTreatment = this.handleTreatment.bind(this);
  }

  handleTreatment(treatment: string) {
    const { currentPatient, assessmentId, location } = this.props.route.params;
    const userService = new UserService();

    if (treatment == 'other') {
      this.props.navigation.navigate('TreatmentOther', { currentPatient, assessmentId, location });
    } else {
      userService.updateAssessment(assessmentId, { treatment }).then((r) => Navigator.gotoEndAssessment());
    }
  }

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

        <Form style={styles.form}>
          {treatmentSelectionOptions.map((item) => {
            return (
              <FieldWrapper style={styles.fieldWrapper} key={item.value}>
                <BigButton onPress={() => this.handleTreatment(item.value)}>
                  <Text>{item.label}</Text>
                </BigButton>
                <CaptionText style={styles.indentedText}>{item.caption}</CaptionText>
              </FieldWrapper>
            );
          })}
        </Form>
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
