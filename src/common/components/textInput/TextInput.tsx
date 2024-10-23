import { TextInput as BaseTextInput, TextInputProps } from 'hds-react';
import React from 'react';

const TextInput: React.FC<TextInputProps> = (props) => {
  return <BaseTextInput crossOrigin={undefined} {...props} />;
};

export default TextInput;
