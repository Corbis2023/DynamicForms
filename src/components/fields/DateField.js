import React from 'react';
import { DatePicker, Form } from 'antd';

const DateField = ({ id, label, required, placeholder = 'Select date', styles, disabled }) => {
  return (
    <Form.Item
      label={<span style={styles?.label}>{label}</span>}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
      style={{ 
        marginBottom: '16px',
      }}
    >
      <DatePicker 
        placeholder={placeholder} 
        disabled={disabled}
        style={{
          width: '100%',
          ...(styles?.input ? {
            color: styles.input.color,
            backgroundColor: styles.input.backgroundColor,
            borderColor: styles.input.borderColor,
            borderWidth: styles.input.borderWidth,
            borderRadius: styles.input.borderRadius,
            boxShadow: styles.input.boxShadow,
          } : {})
        }} 
      />
    </Form.Item>
  );
};

export default DateField;
