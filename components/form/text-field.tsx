import type { ComponentProps } from "react"
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InputProps = Omit<ComponentProps<typeof Input>, "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref" | "children">

/** Ô nhập một dòng gắn react-hook-form: nhãn, dấu `*` bắt buộc, `aria-invalid` và thông báo lỗi. `id` mặc định là tên trường. */
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  id,
  className,
  ...inputProps
}: { control: Control<T>; name: Path<T>; label: string; required?: boolean } & InputProps) {
  const inputId = id ?? name
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={inputId}>
            {label}
            {required && (
              <>
                {" "}
                <span aria-hidden="true" className="text-destructive">*</span>
              </>
            )}
          </FieldLabel>
          <Input {...field} {...inputProps} id={inputId} aria-invalid={fieldState.invalid} className={cn("h-10 rounded-md border-input bg-white text-sm", className)} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
