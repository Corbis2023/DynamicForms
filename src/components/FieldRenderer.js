import React from 'react';
import TextField from './fields/TextField';
import DateField from './fields/DateField';
import DropdownField from './fields/DropdownField';
import MultiSelectField from './fields/MultiSelectField';
import NumberField from './fields/NumberField';
import TextAreaField from './fields/TextAreaField';
import NotesField from './fields/NotesField';
import CheckboxField from './fields/CheckboxField';
import RadioField from './fields/RadioField';

const FieldRenderer = ({ field, formValues = {}, validationRules = [] }) => {
  const { 
    type, 
    id, 
    label, 
    required, 
    placeholder, 
    options,
    decimalPlaces,
    showPercentage,
    heightConversion,
    selectAll,
    layout,
    styles
  } = field;

  // Create custom styles object
  const customStyles = {
    label: {
      color: styles?.labelColor || '#000000',
      fontSize: `${styles?.labelFontSize || 14}px`,
      fontWeight: styles?.labelFontWeight || 'normal',
    },
    input: {
      color: styles?.valueColor || '#000000',
      backgroundColor: styles?.backgroundColor || '#ffffff',
      borderColor: styles?.borderColor || '#d9d9d9',
      borderWidth: `${styles?.borderWidth || 1}px`,
      borderRadius: `${styles?.borderRadius || 4}px`,
      boxShadow: styles?.boxShadow || 'none',
    }
  };

  const commonProps = {
    id,
    label,
    required,
    placeholder,
    styles: customStyles,
  };

  // Check validation rules for show/hide/enable/disable
  const fieldRules = validationRules.filter(rule => rule.fieldId === id);
  let isVisible = true;
  let isEnabled = true;

  fieldRules.forEach(rule => {
    rule.rules.forEach(r => {
      const conditionField = formValues[r.condition.field];
      const conditionMet = evaluateCondition(conditionField, r.condition.operator, r.condition.value);
      
      if (conditionMet) {
        switch (r.action.type) {
          case 'hide':
            isVisible = false;
            break;
          case 'show':
            isVisible = true;
            break;
          case 'disable':
            isEnabled = false;
            break;
          case 'enable':
            isEnabled = true;
            break;
        }
      }
    });
  });

  if (!isVisible) {
    return null;
  }

  const fieldProps = {
    ...commonProps,
    disabled: !isEnabled
  };

  switch (type) {
    case 'text':
      return <TextField {...fieldProps} />;
    case 'date':
      return <DateField {...fieldProps} />;
    case 'dropdown':
      return <DropdownField {...fieldProps} options={options} />;
    case 'multiselect':
      return <MultiSelectField 
        {...fieldProps} 
        options={options} 
        selectAll={selectAll || true}
      />;
    case 'number':
      return <NumberField 
        {...fieldProps} 
        decimalPlaces={decimalPlaces || 0}
        showPercentage={showPercentage || false}
        heightConversion={heightConversion || false}
      />;
    case 'textarea':
      return <TextAreaField {...fieldProps} />;
    case 'notes':
      return <NotesField 
        {...fieldProps} 
        content={field.content || ''}
        fontStyle={field.fontStyle || 'normal'}
        fontWeight={field.fontWeight || 'normal'}
        textDecoration={field.textDecoration || 'none'}
        isConfigMode={true}
      />;
    case 'checkbox':
      return <CheckboxField 
        {...fieldProps} 
        options={options || []} 
        selectAll={selectAll || false}
      />;
    case 'radio':
      return <RadioField 
        {...fieldProps} 
        options={options || []} 
        layout={layout || 'vertical'}
      />;
    default:
      return <div>Unknown field type: {type}</div>;
  }
};

// Helper function to evaluate conditions
const evaluateCondition = (fieldValue, operator, conditionValue) => {
  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }

  const value = String(fieldValue).toLowerCase();
  const condition = String(conditionValue).toLowerCase();

  switch (operator) {
    case 'equals':
      return value === condition;
    case 'not_equals':
      return value !== condition;
    case 'contains':
      return value.includes(condition);
    case 'not_contains':
      return !value.includes(condition);
    case 'starts_with':
      return value.startsWith(condition);
    case 'ends_with':
      return value.endsWith(condition);
    case 'greater_than':
      return parseFloat(fieldValue) > parseFloat(conditionValue);
    case 'less_than':
      return parseFloat(fieldValue) < parseFloat(conditionValue);
    case 'greater_equal':
      return parseFloat(fieldValue) >= parseFloat(conditionValue);
    case 'less_equal':
      return parseFloat(fieldValue) <= parseFloat(conditionValue);
    default:
      return false;
  }
};

export default FieldRenderer;
