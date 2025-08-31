import React from 'react';
import { useDrag } from 'react-dnd';
import { Button, Collapse, Space } from 'antd';
import {
  FontSizeOutlined,
  CalendarOutlined,
  CaretDownOutlined,
  NumberOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  DotChartOutlined,
  AppstoreOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;

const DraggableField = ({ type, label, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'field',
    item: { type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Button 
        type="default" 
        block 
        style={{ 
          marginBottom: 8,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          border: '1px solid #d9d9d9',
          backgroundColor: '#fafafa'
        }}
      >
        <Space>
          {icon}
          {label}
        </Space>
      </Button>
    </div>
  );
};

const FieldList = () => {
  const fieldTypes = [
    { 
      type: 'text', 
      label: 'Text Field',
      icon: <FontSizeOutlined />
    },
    { 
      type: 'date', 
      label: 'Date Field',
      icon: <CalendarOutlined />
    },
    { 
      type: 'dropdown', 
      label: 'Single Select Field',
      icon: <CaretDownOutlined />
    },
    { 
      type: 'multiselect', 
      label: 'Multi-Select Field',
      icon: <AppstoreOutlined />
    },
    { 
      type: 'number', 
      label: 'Number Field',
      icon: <NumberOutlined />
    },
    { 
      type: 'textarea', 
      label: 'Text Area',
      icon: <FileTextOutlined />
    },
    { 
      type: 'notes', 
      label: 'Notes Field',
      icon: <EditOutlined />
    },
    { 
      type: 'checkbox', 
      label: 'Checkbox Field',
      icon: <CheckSquareOutlined />
    },
    { 
      type: 'radio', 
      label: 'Radio Field',
      icon: <DotChartOutlined />
    },
  ];

  return (
    <div>
      <h3>Field List</h3>
      <Collapse defaultActiveKey={['1']}>
        <Panel header="Basic Fields" key="1">
          {fieldTypes.map((field) => (
            <DraggableField 
              key={field.type} 
              type={field.type} 
              label={field.label}
              icon={field.icon}
            />
          ))}
        </Panel>
      </Collapse>
    </div>
  );
};

export default FieldList;
