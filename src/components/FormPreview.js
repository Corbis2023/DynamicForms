import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Typography, Space, Divider, message, Collapse } from 'antd';
import FieldRenderer from './FieldRenderer';

const { Title, Paragraph } = Typography;

const FormPreview = ({ formState, onBack }) => {
  const [form] = Form.useForm();
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localGroups, setLocalGroups] = useState(formState.groups);

  const { formFields, formMetadata } = formState;
  
  // Update local groups when formState changes
  React.useEffect(() => {
    setLocalGroups(formState.groups);
  }, [formState.groups]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submissionData = {
        formId: Date.now(),
        submittedAt: new Date().toISOString(),
        formTitle: formMetadata.title,
        values: values
      };
      
      setSubmittedData(submissionData);
      message.success('Form submitted successfully!');
      console.log('Form submission data:', submissionData);
    } catch (error) {
      message.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSubmittedData(null);
    message.info('Form reset');
  };

  const handleGroupCollapseChange = (activeKeys) => {
    // Update local groups collapse state
    setLocalGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        collapsed: !activeKeys.includes(group.id.toString())
      }))
    );
  };

  const renderFieldsInGrid = (fields) => {
    const rows = [];
    let currentRow = [];
    let currentSpan = 0;

    fields.forEach((field) => {
      if (currentSpan + field.span > 24) {
        rows.push(currentRow);
        currentRow = [field];
        currentSpan = field.span;
      } else {
        currentRow.push(field);
        currentSpan += field.span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={16}>
        {row.map((field) => (
          <Col key={field.id} span={field.span}>
            <FieldRenderer field={field} />
          </Col>
        ))}
      </Row>
    ));
  };

  const renderGroups = () => {
    const collapseItems = localGroups.map((group) => ({
      key: group.id.toString(),
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <strong>{group.name}</strong>
            <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
              ({group.fields?.length || 0} fields)
            </span>
          </span>
        </div>
      ),
      children: (
        <div style={{ minHeight: '60px', padding: '8px 0' }}>
          {group.fields && group.fields.length > 0 ? (
            renderFieldsInGrid(group.fields)
          ) : (
            <Paragraph type="secondary" style={{ textAlign: 'center', margin: 0 }}>
              No fields in this group
            </Paragraph>
          )}
        </div>
      )
    }));

    // Get active keys based on collapsed state
    const activeKeys = localGroups
      .filter(group => !group.collapsed)
      .map(group => group.id.toString());

    return (
      <Collapse
        items={collapseItems}
        activeKey={activeKeys}
        onChange={handleGroupCollapseChange}
        style={{ marginBottom: '16px' }}
        size="small"
      />
    );
  };

  if (submittedData) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} type="success">Form Submitted Successfully!</Title>
            <Paragraph>Thank you for your submission. Here's a summary of your data:</Paragraph>
          </div>
          
          <Card title="Submission Details" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <strong>Form ID:</strong> {submittedData.formId}
              </Col>
              <Col span={12}>
                <strong>Submitted At:</strong> {new Date(submittedData.submittedAt).toLocaleString()}
              </Col>
            </Row>
          </Card>

          <Card title="Submitted Data" size="small">
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(submittedData.values, null, 2)}
            </pre>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setSubmittedData(null)}>
                Submit Another Response
              </Button>
              <Button type="primary" onClick={onBack}>
                Back to Form Builder
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level={2}>{formMetadata.title}</Title>
        {formMetadata.description && (
          <Paragraph type="secondary">{formMetadata.description}</Paragraph>
        )}
        <Button type="link" onClick={onBack} style={{ marginBottom: '16px' }}>
          ← Back to Form Builder
        </Button>
        <Divider />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        {/* Render Groups */}
        {localGroups.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            {renderGroups()}
          </div>
        )}

        {/* Render Ungrouped Fields */}
        {formFields.length > 0 && (
          <Card title="Form Fields" style={{ marginBottom: '24px' }}>
            {renderFieldsInGrid(formFields)}
          </Card>
        )}

        {/* Show message if no fields */}
        {formFields.length === 0 && localGroups.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Paragraph type="secondary">
                No fields have been added to this form yet.
              </Paragraph>
              <Button type="primary" onClick={onBack}>
                Add Fields to Form
              </Button>
            </div>
          </Card>
        )}

        {/* Submit buttons - only show if there are fields */}
        {(formFields.length > 0 || localGroups.some(g => g.fields && g.fields.length > 0)) && (
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Space size="large">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isSubmitting}
                  size="large"
                >
                  Submit Form
                </Button>
                <Button 
                  htmlType="button" 
                  onClick={handleReset}
                  size="large"
                >
                  Reset Form
                </Button>
              </Space>
            </div>
          </Card>
        )}
      </Form>

      {/* Form metadata footer */}
      <div style={{ 
        marginTop: '40px', 
        padding: '16px', 
        background: '#fafafa', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        <Row gutter={16}>
          <Col span={8}>
            <strong>Created:</strong> {new Date(formMetadata.createdAt).toLocaleDateString()}
          </Col>
          <Col span={8}>
            <strong>Updated:</strong> {new Date(formMetadata.updatedAt).toLocaleDateString()}
          </Col>
          <Col span={8}>
            <strong>Fields:</strong> {formFields.length + localGroups.reduce((acc, g) => acc + (g.fields?.length || 0), 0)}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FormPreview;
