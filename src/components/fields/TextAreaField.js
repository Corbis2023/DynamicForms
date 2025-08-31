import React from 'react';
import { Input, Form } from 'antd';

const { TextArea } = Input;

const TextAreaField = ({ id, label, required, placeholder = 'Enter text', styles, disabled }) => {
  return (
    <Form.Item
      label={<span style={styles?.label}>{label}</span>}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
      style={{ 
        marginBottom: '16px',
      }}
    >
      <TextArea 
        rows={4} 
        placeholder={placeholder} 
        disabled={disabled}
        style={styles?.input ? {
          color: styles.input.color,
          backgroundColor: styles.input.backgroundColor,
          borderColor: styles.input.borderColor,
          borderWidth: styles.input.borderWidth,
          borderRadius: styles.input.borderRadius,
          boxShadow: styles.input.boxShadow,
        } : {}}
      />
    </Form.Item>
  );
};

export default TextAreaField;
