// Form export and import utilities

export const exportFormAsJSON = (formState) => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    formData: {
      metadata: formState.formMetadata,
      fields: formState.formFields,
      groups: formState.groups
    }
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `form-${formState.formMetadata.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFormFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate the imported data structure
        if (!importData.formData || !importData.formData.fields) {
          throw new Error('Invalid form data structure');
        }
        
        // Ensure all required fields have IDs
        const fieldsWithIds = importData.formData.fields.map(field => ({
          ...field,
          id: field.id || Date.now() + Math.random()
        }));
        
        const groupsWithIds = (importData.formData.groups || []).map(group => ({
          ...group,
          id: group.id || Date.now() + Math.random(),
          fields: group.fields.map(field => ({
            ...field,
            id: field.id || Date.now() + Math.random()
          }))
        }));
        
        const formState = {
          formFields: fieldsWithIds,
          groups: groupsWithIds,
          isPreviewMode: false,
          formMetadata: {
            ...importData.formData.metadata,
            importedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        
        resolve(formState);
      } catch (error) {
        reject(new Error('Failed to parse form data: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const exportFormAsHTML = (formState) => {
  const { formFields, groups, formMetadata } = formState;
  
  const generateFieldHTML = (field) => {
    const { type, label, required, placeholder, options, span } = field;
    const requiredAttr = required ? 'required' : '';
    const colClass = `col-md-${Math.floor(span / 24 * 12)}`;
    
    switch (type) {
      case 'text':
        return `
          <div class="${colClass} mb-3">
            <label class="form-label">${label}${required ? ' *' : ''}</label>
            <input type="text" class="form-control" placeholder="${placeholder || ''}" ${requiredAttr}>
          </div>`;
      
      case 'number':
        return `
          <div class="${colClass} mb-3">
            <label class="form-label">${label}${required ? ' *' : ''}</label>
            <input type="number" class="form-control" placeholder="${placeholder || ''}" ${requiredAttr}>
          </div>`;
      
      case 'date':
        return `
          <div class="${colClass} mb-3">
            <label class="form-label">${label}${required ? ' *' : ''}</label>
            <input type="date" class="form-control" ${requiredAttr}>
          </div>`;
      
      case 'textarea':
        return `
          <div class="${colClass} mb-3">
            <label class="form-label">${label}${required ? ' *' : ''}</label>
            <textarea class="form-control" rows="3" placeholder="${placeholder || ''}" ${requiredAttr}></textarea>
          </div>`;
      
      case 'dropdown':
        const optionsHTML = (options || []).map(option => 
          `<option value="${option}">${option}</option>`
        ).join('');
        return `
          <div class="${colClass} mb-3">
            <label class="form-label">${label}${required ? ' *' : ''}</label>
            <select class="form-select" ${requiredAttr}>
              <option value="">Choose...</option>
              ${optionsHTML}
            </select>
          </div>`;
      
      default:
        return `<div class="${colClass} mb-3"><p>Unknown field type: ${type}</p></div>`;
    }
  };
  
  const fieldsHTML = formFields.map(generateFieldHTML).join('');
  
  const groupsHTML = groups.map(group => `
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">${group.name}</h5>
      </div>
      <div class="card-body">
        <div class="row">
          ${group.fields.map(generateFieldHTML).join('')}
        </div>
      </div>
    </div>
  `).join('');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formMetadata.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { padding: 20px; }
        .form-container { max-width: 800px; margin: 0 auto; }
        .required { color: red; }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="mb-4">
            <h1>${formMetadata.title}</h1>
            ${formMetadata.description ? `<p class="text-muted">${formMetadata.description}</p>` : ''}
        </div>
        
        <form id="dynamicForm">
            ${groupsHTML}
            
            ${formFields.length > 0 ? `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Form Fields</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${fieldsHTML}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary">Submit Form</button>
                <button type="reset" class="btn btn-secondary">Reset</button>
            </div>
        </form>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.getElementById('dynamicForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            console.log('Form submitted with data:', data);
            alert('Form submitted! Check console for data.');
        });
    </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${formMetadata.title.replace(/\s+/g, '-').toLowerCase()}-form.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const validateFormStructure = (formData) => {
  const errors = [];
  
  if (!formData.formFields || !Array.isArray(formData.formFields)) {
    errors.push('Form fields must be an array');
  }
  
  if (!formData.formMetadata || typeof formData.formMetadata !== 'object') {
    errors.push('Form metadata is required');
  }
  
  if (formData.formFields) {
    formData.formFields.forEach((field, index) => {
      if (!field.type) {
        errors.push(`Field at index ${index} is missing type`);
      }
      if (!field.label) {
        errors.push(`Field at index ${index} is missing label`);
      }
      if (!field.id) {
        errors.push(`Field at index ${index} is missing id`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
