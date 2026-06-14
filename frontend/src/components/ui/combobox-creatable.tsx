"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxCreatableProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  onCreateOption?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function ComboboxCreatable({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = "Selecione uma opção...",
  emptyText = "Nenhuma opção encontrada.",
  className
}: ComboboxCreatableProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const selectedOption = options.find((opt) => opt.value === value)

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue)
    setOpen(false)
    setInputValue("")
  }

  const handleCreate = () => {
    if (inputValue && onCreateOption) {
      onCreateOption(inputValue)
      onChange(inputValue)
      setOpen(false)
      setInputValue("")
    }
  }

  // Se tem search text mas não achou na lista (match exato, case insensitive)
  const showCreateOption = 
    inputValue.trim() !== "" && 
    !options.some(opt => opt.label.toLowerCase() === inputValue.trim().toLowerCase()) &&
    onCreateOption !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className, !value && "text-slate-500")}
        >
          {selectedOption ? selectedOption.label : value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar..." 
            value={inputValue} 
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {showCreateOption ? (
                <div 
                  className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                  onClick={handleCreate}
                >
                  <PlusCircle className="h-4 w-4" />
                  Criar "{inputValue}"
                </div>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Command match against the text
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {showCreateOption && options.length > 0 && (
                <CommandItem
                  key="create-new"
                  value={inputValue}
                  onSelect={handleCreate}
                  className="text-indigo-600 font-medium mt-1 border-t border-slate-100 pt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
