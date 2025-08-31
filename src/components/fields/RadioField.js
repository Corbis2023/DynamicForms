import React from 'react';
import { Radio, Form } from 'antd';

const RadioField = ({ id, label, required, options = [], layout = 'vertical' }) => {
  return (
    <Form.Item
      label={label}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
    >
      <Radio.Group>
        {layout === 'vertical' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.map((option, index) => (
              <Radio key={index} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label || option.value}
              </Radio>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {options.map((option, index) => (
              <Radio key={index} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label || option.value}
              </Radio>
            ))}
          </div>
        )}
      </Radio.Group>
    </Form.Item>
  );
};

export default RadioField;
