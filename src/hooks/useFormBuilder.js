import { useReducer } from 'react';

// Action types
const ACTIONS = {
  ADD_FIELD: 'ADD_FIELD',
  UPDATE_FIELD: 'UPDATE_FIELD',
  DELETE_FIELD: 'DELETE_FIELD',
  MOVE_FIELD: 'MOVE_FIELD',
  MOVE_FIELD_WITHIN_GROUP: 'MOVE_FIELD_WITHIN_GROUP',
  MOVE_GROUP: 'MOVE_GROUP',
  ADD_GROUP: 'ADD_GROUP',
  UPDATE_GROUP: 'UPDATE_GROUP',
  DELETE_GROUP: 'DELETE_GROUP',
  ADD_FIELD_TO_GROUP: 'ADD_FIELD_TO_GROUP',
  REMOVE_FIELD_FROM_GROUP: 'REMOVE_FIELD_FROM_GROUP',
  SET_PREVIEW_MODE: 'SET_PREVIEW_MODE',
  IMPORT_FORM: 'IMPORT_FORM',
  RESET_FORM: 'RESET_FORM',
  ADD_VALIDATION_RULE: 'ADD_VALIDATION_RULE',
  UPDATE_VALIDATION_RULE: 'UPDATE_VALIDATION_RULE',
  DELETE_VALIDATION_RULE: 'DELETE_VALIDATION_RULE',
  TOGGLE_GROUP_COLLAPSE: 'TOGGLE_GROUP_COLLAPSE'
};

// Initial state
const initialState = {
  formFields: [],
  groups: [],
  validationRules: [],
  isPreviewMode: false,
  formMetadata: {
    title: 'Untitled Form',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Reducer function
const formBuilderReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_FIELD:
      return {
        ...state,
        formFields: [...state.formFields, action.payload],
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        formFields: state.formFields.map(field =>
          field.id === action.payload.id ? { ...field, ...action.payload.updates } : field
        ),
        groups: state.groups.map(group => ({
          ...group,
          fields: group.fields.map(field =>
            field.id === action.payload.id ? { ...field, ...action.payload.updates } : field
          )
        })),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.DELETE_FIELD:
      return {
        ...state,
        formFields: state.formFields.filter(field => field.id !== action.payload),
        groups: state.groups.map(group => ({
          ...group,
          fields: group.fields.filter(field => field.id !== action.payload)
        })),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.MOVE_FIELD:
      const { fromIndex, toIndex } = action.payload;
      const newFields = [...state.formFields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      return {
        ...state,
        formFields: newFields,
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.ADD_GROUP:
      return {
        ...state,
        groups: [...state.groups, {
          id: Date.now(),
          name: action.payload.name,
          fields: [],
          collapsed: false,
          createdAt: new Date().toISOString()
        }],
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.UPDATE_GROUP:
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? { ...group, ...action.payload.updates } : group
        ),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.DELETE_GROUP:
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.ADD_FIELD_TO_GROUP:
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, fields: [...group.fields, action.payload.field] }
            : group
        ),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.REMOVE_FIELD_FROM_GROUP:
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, fields: group.fields.filter(field => field.id !== action.payload.fieldId) }
            : group
        ),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.SET_PREVIEW_MODE:
      return {
        ...state,
        isPreviewMode: action.payload
      };

    case ACTIONS.IMPORT_FORM:
      return {
        ...action.payload,
        formMetadata: {
          ...action.payload.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.RESET_FORM:
      return {
        ...initialState,
        formMetadata: {
          ...initialState.formMetadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.ADD_VALIDATION_RULE:
      return {
        ...state,
        validationRules: [...state.validationRules, action.payload],
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.UPDATE_VALIDATION_RULE:
      return {
        ...state,
        validationRules: state.validationRules.map(rule =>
          rule.fieldId === action.payload.fieldId ? action.payload : rule
        ),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.DELETE_VALIDATION_RULE:
      return {
        ...state,
        validationRules: state.validationRules.filter(rule => rule.fieldId !== action.payload),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.MOVE_FIELD_WITHIN_GROUP:
      const { groupId, fromIndex: fieldFromIndex, toIndex: fieldToIndex } = action.payload;
      return {
        ...state,
        groups: state.groups.map(group => {
          if (group.id === groupId) {
            const newGroupFields = [...group.fields];
            const [movedGroupField] = newGroupFields.splice(fieldFromIndex, 1);
            newGroupFields.splice(fieldToIndex, 0, movedGroupField);
            return { ...group, fields: newGroupFields };
          }
          return group;
        }),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.MOVE_GROUP:
      const { fromIndex: groupFromIndex, toIndex: groupToIndex } = action.payload;
      const newGroups = [...state.groups];
      const [movedGroup] = newGroups.splice(groupFromIndex, 1);
      newGroups.splice(groupToIndex, 0, movedGroup);
      return {
        ...state,
        groups: newGroups,
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    case ACTIONS.TOGGLE_GROUP_COLLAPSE:
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload ? { ...group, collapsed: !group.collapsed } : group
        ),
        formMetadata: {
          ...state.formMetadata,
          updatedAt: new Date().toISOString()
        }
      };

    default:
      return state;
  }
};

// Custom hook
export const useFormBuilder = () => {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);

  const actions = {
    addField: (field) => dispatch({ type: ACTIONS.ADD_FIELD, payload: field }),
    updateField: (id, updates) => dispatch({ type: ACTIONS.UPDATE_FIELD, payload: { id, updates } }),
    deleteField: (id) => dispatch({ type: ACTIONS.DELETE_FIELD, payload: id }),
    moveField: (fromIndex, toIndex) => dispatch({ type: ACTIONS.MOVE_FIELD, payload: { fromIndex, toIndex } }),
    moveFieldWithinGroup: (groupId, fromIndex, toIndex) => dispatch({ type: ACTIONS.MOVE_FIELD_WITHIN_GROUP, payload: { groupId, fromIndex, toIndex } }),
    moveGroup: (fromIndex, toIndex) => dispatch({ type: ACTIONS.MOVE_GROUP, payload: { fromIndex, toIndex } }),
    addGroup: (name) => dispatch({ type: ACTIONS.ADD_GROUP, payload: { name } }),
    updateGroup: (id, updates) => dispatch({ type: ACTIONS.UPDATE_GROUP, payload: { id, updates } }),
    deleteGroup: (id) => dispatch({ type: ACTIONS.DELETE_GROUP, payload: id }),
    addFieldToGroup: (groupId, field) => dispatch({ type: ACTIONS.ADD_FIELD_TO_GROUP, payload: { groupId, field } }),
    removeFieldFromGroup: (groupId, fieldId) => dispatch({ type: ACTIONS.REMOVE_FIELD_FROM_GROUP, payload: { groupId, fieldId } }),
    setPreviewMode: (isPreview) => dispatch({ type: ACTIONS.SET_PREVIEW_MODE, payload: isPreview }),
    importForm: (formData) => dispatch({ type: ACTIONS.IMPORT_FORM, payload: formData }),
    resetForm: () => dispatch({ type: ACTIONS.RESET_FORM }),
    addValidationRule: (rule) => dispatch({ type: ACTIONS.ADD_VALIDATION_RULE, payload: rule }),
    updateValidationRule: (rule) => dispatch({ type: ACTIONS.UPDATE_VALIDATION_RULE, payload: rule }),
    deleteValidationRule: (fieldId) => dispatch({ type: ACTIONS.DELETE_VALIDATION_RULE, payload: fieldId }),
    toggleGroupCollapse: (groupId) => dispatch({ type: ACTIONS.TOGGLE_GROUP_COLLAPSE, payload: groupId })
  };

  return { state, actions };
};

export { ACTIONS };
