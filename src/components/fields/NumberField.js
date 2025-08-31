import React, { useState, useEffect } from 'react';
import { InputNumber, Form, Select, Space, Typography, Divider } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const NumberField = ({ 
  id, 
  label, 
  required, 
  placeholder = 'Enter number',
  decimalPlaces = 0,
  showPercentage = false,
  heightConversion = false,
  heightUnit = 'cm',
  styles,
  disabled
}) => {
  const [value, setValue] = useState(null);
  const [percentageValue, setPercentageValue] = useState(null);
  const [heightValues, setHeightValues] = useState({
    feet: null,
    inches: null,
    cm: null
  });

  // Height conversion functions
  const convertHeight = (value, fromUnit, toUnit) => {
    if (!value) return null;
    
    // Convert to cm first
    let cmValue;
    switch (fromUnit) {
      case 'feet':
        cmValue = value * 30.48;
        break;
      case 'inches':
        cmValue = value * 2.54;
        break;
      case 'cm':
        cmValue = value;
        break;
      default:
        return null;
    }

    // Convert from cm to target unit
    switch (toUnit) {
      case 'feet':
        return Math.round((cmValue / 30.48) * 1000) / 1000;
      case 'inches':
        return Math.round((cmValue / 2.54) * 1000) / 1000;
      case 'cm':
        return Math.round(cmValue * 1000) / 1000;
      default:
        return null;
    }
  };

  const handleHeightChange = (newValue, unit) => {
    const newHeightValues = { ...heightValues, [unit]: newValue };
    
    if (newValue) {
      // Update other units
      if (unit === 'feet') {
        newHeightValues.inches = convertHeight(newValue, 'feet', 'inches');
        newHeightValues.cm = convertHeight(newValue, 'feet', 'cm');
      } else if (unit === 'inches') {
        newHeightValues.feet = convertHeight(newValue, 'inches', 'feet');
        newHeightValues.cm = convertHeight(newValue, 'inches', 'cm');
      } else if (unit === 'cm') {
        newHeightValues.feet = convertHeight(newValue, 'cm', 'feet');
        newHeightValues.inches = convertHeight(newValue, 'cm', 'inches');
      }
    } else {
      // Clear all values if input is cleared
      newHeightValues.feet = null;
      newHeightValues.inches = null;
      newHeightValues.cm = null;
    }
    
    setHeightValues(newHeightValues);
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
    if (showPercentage && newValue) {
      setPercentageValue((newValue * 100).toFixed(decimalPlaces));
    } else {
      setPercentageValue(null);
    }
  };

  if (heightConversion) {
    return (
      <Form.Item
        label={<span style={styles?.label}>{label}</span>}
        name={id}
        rules={required ? [{ required: true, message: `${label} is required` }] : []}
        style={{ 
          marginBottom: '16px',
        }}
      >
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <div>
                <Text strong>Feet:</Text>
                <InputNumber
                  placeholder="Feet"
                  value={heightValues.feet}
                  onChange={(val) => handleHeightChange(val, 'feet')}
                  precision={3}
                  disabled={disabled}
                  style={{
                    width: 80, 
                    marginLeft: 8,
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
              </div>
              <div>
                <Text strong>Inches:</Text>
                <InputNumber
                  placeholder="Inches"
                  value={heightValues.inches}
                  onChange={(val) => handleHeightChange(val, 'inches')}
                  precision={3}
                  disabled={disabled}
                  style={{
                    width: 80, 
                    marginLeft: 8,
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
              </div>
              <div>
                <Text strong>CM:</Text>
                <InputNumber
                  placeholder="Centimeters"
                  value={heightValues.cm}
                  onChange={(val) => handleHeightChange(val, 'cm')}
                  precision={3}
                  disabled={disabled}
                  style={{
                    width: 100, 
                    marginLeft: 8,
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
              </div>
            </Space>
            {(heightValues.feet || heightValues.inches || heightValues.cm) && (
              <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Text type="secondary">
                  Conversions: {heightValues.feet?.toFixed(2)} ft = {heightValues.inches?.toFixed(2)} in = {heightValues.cm?.toFixed(2)} cm
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Form.Item>
    );
  }

  return (
    <Form.Item
      label={<span style={styles?.label}>{label}</span>}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
      style={{ 
        marginBottom: '16px',
      }}
    >
      <div>
        <InputNumber
          placeholder={placeholder}
          precision={decimalPlaces}
          value={value}
          onChange={handleValueChange}
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
        {showPercentage && percentageValue && (
          <div style={{ marginTop: 4 }}>
            <Text type="secondary">
              Percentage: {percentageValue}%
            </Text>
          </div>
        )}
      </div>
    </Form.Item>
  );
};

export default NumberField;
