import { Button as BaseButton, ButtonProps, ButtonVariant } from 'hds-react';
import React from 'react';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = ButtonVariant.Primary, ...rest }, ref) => {
    return (
      <BaseButton
        variant={variant as Exclude<ButtonVariant, ButtonVariant.Supplementary>}
        className={className}
        ref={ref}
        {...rest}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
