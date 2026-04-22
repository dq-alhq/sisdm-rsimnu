'use client'

import { type AutocompleteProps, Autocomplete as RACAutocomplete } from 'react-aria-components'

export const fuzzy = (textValue: string, inputValue: string): boolean => {
    if (inputValue.length === 0) return true
    if (textValue.length === 0) return false
    let textIndex = 0
    let inputIndex = 0
    while (textIndex < textValue.length && inputIndex < inputValue.length) {
        if (textValue.toLowerCase()[textIndex] === inputValue.toLowerCase()[inputIndex]) {
            inputIndex++
        }
        textIndex++
    }
    return inputIndex === inputValue.length
}

const Autocomplete = ({ ...props }: AutocompleteProps) => {
    return <RACAutocomplete {...props} filter={props.filter ?? fuzzy} />
}

export { Autocomplete }
