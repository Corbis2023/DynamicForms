import React from 'react';
import { Checkbox, Form, Button, Space } from 'antd';

const CheckboxField = ({ id, label, required, options = [], selectAll = false }) => {
  const [checkedList, setCheckedList] = React.useState([]);
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [checkAll, setCheckAll] = React.useState(false);

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < options.length);
    setCheckAll(list.length === options.length);
  };

  const onCheckAllChange = (e) => {
    const allValues = options.map(opt => typeof opt === 'string' ? opt : opt.value);
    setCheckedList(e.target.checked ? allValues : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  return (
    <Form.Item
      label={label}
      name={id}
      rules={required ? [{ required: true, message: `${label} is required` }] : []}
    >
      <div>
        {selectAll && options.length > 1 && (
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              Select All
            </Checkbox>
          </div>
        )}
        <Checkbox.Group
          options={options.map(opt => 
            typeof opt === 'string' 
              ? { label: opt, value: opt }
              : { label: opt.label || opt.value, value: opt.value }
          )}
          value={checkedList}
          onChange={onChange}
        />
      </div>
    </Form.Item>
  );
};

export default CheckboxField;
