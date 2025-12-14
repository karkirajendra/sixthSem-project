export const validatePage = (page) => {
  const errors = {};
  
  if (!page.title?.trim()) {
    errors.title = 'Title is required';
  } else if (page.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (!page.type) {
    errors.type = 'Page type is required';
  }
  
  if (!page.content?.trim()) {
    errors.content = 'Content is required';
  } else if (page.content.length > 10000) {
    errors.content = 'Content is too long';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};