import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const dateFormat = (date: string): string => {
  if (!date) return '';

  return format(new Date(date), 'd MMM yyyy', {
    locale: ptBR,
  });
};
