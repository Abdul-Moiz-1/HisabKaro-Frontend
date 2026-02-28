import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useTheme } from '../../../../store/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ScrollView, View } from 'react-native';
import {
  AmountInputField,
  DateField,
  DropdownField,
} from '../../../../components/DynamicForm';
import { DropdownOption, FieldType } from '../../../../types/forms';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  JournalEntryFormValues,
  JournalEntryLineFormValues,
  journalEntrySchema,
} from '../schema';
import { zodResolver } from '@hookform/resolvers/zod';

const MOCK_ACCOUNTS: DropdownOption[] = [
  {
    label: 'cash',
    value: 1,
  },
  {
    label: 'bank',
    value: 2,
  },
];
const JournalEntryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    mode: 'onChange',
    defaultValues: {
      postingDate: new Date().getDate().toString(),
      lineItems: [
        { accountId: 0, debit: 0, credit: 0 },
        { accountId: 0, debit: 0, credit: 0 },
      ],
      remarks: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const renderLineItem = (item: JournalEntryLineFormValues, index: number) => {
    return (
      <View>
        <View>
          <Controller
            control={control}
            name={`lineItems.${index}.accountId`}
            render={({ field }) => (
              <DropdownField
                field={{
                  id: `account-${index}`,
                  label: 'Account / Khata',
                  name: field.name,
                  type: FieldType.DROPDOWN,
                  options: MOCK_ACCOUNTS,
                }}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.lineItems?.[index]?.accountId?.message}
              />
            )}
          />
        </View>
        <View>
          <View>
            <Controller
              control={control}
              name={`lineItems.${index}.debit`}
              render={({ field }) => (
                <AmountInputField
                  field={{
                    id: `debit-${index}`,
                    label: 'Debit',
                    name: field.name,
                    type: FieldType.AMOUNT,
                  }}
                  value={field.value?.toString() || ''}
                  onChange={value => field.onChange(Number(value))}
                  onBlur={field.onBlur}
                  error={errors.lineItems?.[index]?.debit?.message}
                />
              )}
            />
          </View>
          <View>
            <Controller
              control={control}
              name={`lineItems.${index}.credit`}
              render={({ field }) => (
                <AmountInputField
                  field={{
                    id: `credit-${index}`,
                    label: 'Credit',
                    name: field.name,
                    type: FieldType.AMOUNT,
                  }}
                  value={field.value?.toString() || ''}
                  onChange={value => field.onChange(Number(value))}
                  onBlur={field.onBlur}
                  error={errors.lineItems?.[index]?.credit?.message}
                />
              )}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Controller
            control={control}
            name="postingDate"
            render={({ field: { onChange, value } }) => (
              <DateField
                field={{
                  id: 'postingDate',
                  label: 'Date / Tareekh',
                  name: 'postingDate',
                  type: FieldType.DATE,
                }}
                value={value}
                onChange={onChange}
                error={errors.postingDate?.message}
                onBlur={() => {}}
              />
            )}
          />
        </View>
        <View>{fields.map((item, index) => renderLineItem(item, index))}</View>
        <Button
          title="Add Line Item"
          onPress={() => append({ accountId: 0, debit: 0, credit: 0 })}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JournalEntryScreen;
