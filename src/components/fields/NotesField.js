import React from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

const NotesField = ({ 
  id, 
  label, 
  required, 
  placeholder = 'This is a notes field. Configure it to add your content.', 
  styles, 
  disabled,
  content = '',
  fontStyle = 'normal', // normal, italic
  fontWeight = 'normal', // normal, bold
  textDecoration = 'none', // none, underline
  isConfigMode = true // Show as config mode by default in form builder
}) => {
  // Create text style based on formatting options
  const textStyle = {
    fontStyle: fontStyle,
    fontWeight: fontWeight,
    textDecoration: textDecoration,
    margin: 0,
    padding: '8px 0',
    border: 'none',
    background: 'transparent',
    ...(styles?.input ? {
      color: styles.input.color,
      backgroundColor: styles.input.backgroundColor,
    } : {
      color: '#666',
      backgroundColor: 'transparent'
    })
  };

  const labelStyle = {
    ...styles?.label,
    marginBottom: '4px',
    display: 'block'
  };

  // In configuration mode, show placeholder text
  if (isConfigMode || !content) {
    return (
      <div style={{ marginBottom: '16px' }}>
        {label && <span style={labelStyle}>{label}</span>}
        <Paragraph 
          style={{
            ...textStyle,
            fontStyle: 'italic',
            color: '#999',
            border: '1px dashed #d9d9d9',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: '#fafafa'
          }}
        >
          {placeholder}
        </Paragraph>
      </div>
    );
  }

  // In preview/form mode, show actual content
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <span style={labelStyle}>{label}</span>}
      <Paragraph style={textStyle}>
        {content}
      </Paragraph>
    </div>
  );
};

export default NotesField;
