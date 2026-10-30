import * as React from 'react';
import {styled} from '@mui/joy/styles';
import Input from '@mui/joy/Input';

const StyledInput = styled('input')({
  border: 'none', // remove the native input border
  minWidth: 0, // remove the native input width
  outline: 0, // remove the native input outline
  padding: 0, // remove the native input padding
  paddingTop: '1em',
  flex: 1,
  color: 'inherit',
  backgroundColor: 'transparent',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontStyle: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  textOverflow: 'ellipsis',
  '&::placeholder': {
    opacity: 0,
    transition: '0.1s ease-out',
  },
  '&:focus::placeholder': {
    opacity: 1,
  },
  '&:focus ~ label, &:not(:placeholder-shown) ~ label, &:-webkit-autofill ~ label': {
    top: '0.5rem',
    fontSize: '0.75rem',
  },
  '&:focus ~ label': {
    color: '#8a6d1f',
  },
  '&:-webkit-autofill': {
    alignSelf: 'stretch', // to fill the height of the root slot
  },
  '&:-webkit-autofill:not(* + &)': {
    marginInlineStart: 'calc(-1 * var(--Input-paddingInline))',
    paddingInlineStart: 'var(--Input-paddingInline)',
    borderTopLeftRadius:
      'calc(var(--Input-radius) - var(--variant-borderWidth, 0px))',
    borderBottomLeftRadius:
      'calc(var(--Input-radius) - var(--variant-borderWidth, 0px))',
  },
});

const StyledLabel = styled('label')(({ theme }) => ({
  position: 'absolute',
  lineHeight: 1,
  top: 'calc((var(--Input-minHeight) - 1em) / 2)',
  color: '#7a6a3a',
  fontFamily: 'Minion Pro Regular',
  pointerEvents: 'none',
  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
}));

const InnerInput = (props) => {
  const id = React.useId()
  return <>
    <StyledInput {...props} id={id} />
    <StyledLabel htmlFor={id}>{props.label}</StyledLabel>
  </>
}

// Общий вид поля: кремовый фон, золотая рамка и подсветка при фокусе. Через style экраны задают только расположение (ширина, отступы)
const baseSx = {
  '--Input-minHeight': '52px',
  '--Input-radius': '16px',
  '--Input-paddingInline': '16px',
  '--Input-focusedThickness': '2px',
  '--Input-focusedHighlight': '#b0953f',
  background: '#fff',
  borderColor: '#c9b36a',
  color: '#1d1810',
  boxShadow: 'none',
  fontFamily: 'Minion Pro Regular',
  fontSize: '16px',
  '&:hover': {
    background: '#fff',
    borderColor: '#b0953f',
  },
}

const FloatingLabelInput = ({style, onChange, onBlur, placeholder, label, value, defaultValue, inputMode}) => {
  return <Input
    onChange={onChange}
    onBlur={onBlur}
    slots={{input: InnerInput}}
    slotProps={{input: {placeholder: placeholder || '', label, inputMode}}}
    sx={[baseSx, style]}
    value={value}
    defaultValue={defaultValue}
  />
}

export default FloatingLabelInput