import type { Person, QuizMode, Tense } from './types';

export interface CourseExample {
  spanish: string;
  russian: string;
  note?: string;
}

export interface CourseSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  examples?: CourseExample[];
  warning?: string;
}

export interface CoursePractice {
  tense: Tense;
  persons: Person[];
  verbIds: string[];
  mode: QuizMode;
  maxQuestions: 10 | 20 | 30 | 50;
}

export interface CourseLesson {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  duration: string;
  sections: CourseSection[];
  practice: CoursePractice;
}

const ALL_PERSONS: Person[] = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'];

export const PRESENT_MODULE_LESSONS: CourseLesson[] = [
  {
    id: 'present-persons',
    order: 1,
    title: 'Лицо и форма глагола',
    subtitle: 'Как читать спряжение и почему местоимение часто исчезает',
    duration: '7 мин',
    sections: [
      {
        title: 'Инфинитив и личная форма',
        paragraphs: [
          'Инфинитив называет действие: hablar — говорить, comer — есть, vivir — жить. В предложении окончание меняется и показывает, кто действует.',
          'Испанскому обычно не нужно отдельное местоимение перед глаголом: hablo уже означает «я говорю». Местоимение добавляют для контраста, ясности или акцента.',
        ],
        examples: [
          { spanish: 'Hablo español.', russian: 'Я говорю по-испански.' },
          { spanish: 'Yo hablo, pero él escucha.', russian: 'Я говорю, а он слушает.', note: 'Yo подчёркивает контраст.' },
        ],
      },
      {
        title: 'Шесть позиций',
        paragraphs: [
          'Таблица строится по лицам: yo, tú, él/ella/usted, nosotros/as, vosotros/as, ellos/ellas/ustedes.',
        ],
        bullets: [
          'usted употребляется с формой 3-го лица единственного числа;',
          'ustedes — с формой 3-го лица множественного числа;',
          'в Латинской Америке ustedes обычно заменяет vosotros во множественном числе.',
        ],
        warning: 'Не переводите usted как «он/она»: это вежливое «вы», хотя форма глагола совпадает с él/ella.',
      },
    ],
    practice: {
      tense: 'presente',
      persons: ALL_PERSONS,
      verbIds: ['hablar', 'comer', 'vivir'],
      mode: 'multiple-choice',
      maxQuestions: 10,
    },
  },
  {
    id: 'present-ar',
    order: 2,
    title: 'Правильные глаголы на -AR',
    subtitle: 'hablo, hablas, habla — первая модель настоящего времени',
    duration: '8 мин',
    sections: [
      {
        title: 'Как собрать форму',
        paragraphs: [
          'У правильного глагола уберите -ar и добавьте окончание нужного лица.',
          'Для hablar основа — habl-. Получается: hablo, hablas, habla, hablamos, habláis, hablan.',
        ],
        bullets: ['yo: -o', 'tú: -as', 'él/ella/usted: -a', 'nosotros/as: -amos', 'vosotros/as: -áis', 'ellos/ellas/ustedes: -an'],
      },
      {
        title: 'Не теряйте ударение',
        paragraphs: [
          'В форме vosotros окончание -áis пишется с ударением. Это часть формы, а не украшение типографа.',
        ],
        examples: [
          { spanish: 'Trabajamos de noche.', russian: 'Мы работаем ночью.' },
          { spanish: '¿Necesitas ayuda?', russian: 'Тебе нужна помощь?' },
          { spanish: 'Ellas estudian español.', russian: 'Они изучают испанский.' },
        ],
      },
    ],
    practice: {
      tense: 'presente',
      persons: ALL_PERSONS,
      verbIds: ['hablar', 'trabajar', 'estudiar', 'necesitar', 'llamar', 'comprar'],
      mode: 'input',
      maxQuestions: 10,
    },
  },
  {
    id: 'present-er',
    order: 3,
    title: 'Правильные глаголы на -ER',
    subtitle: 'comer как модель второй группы',
    duration: '8 мин',
    sections: [
      {
        title: 'Окончания -ER',
        paragraphs: [
          'Уберите -er. К основе com- добавляются: como, comes, come, comemos, coméis, comen.',
        ],
        bullets: ['yo: -o', 'tú: -es', 'él/ella/usted: -e', 'nosotros/as: -emos', 'vosotros/as: -éis', 'ellos/ellas/ustedes: -en'],
      },
      {
        title: 'Сравните с -AR',
        paragraphs: [
          'Форма yo снова оканчивается на -o. Главное различие слышно в гласной: hablas, но comes; hablan, но comen.',
        ],
        examples: [
          { spanish: 'Bebo café.', russian: 'Я пью кофе.' },
          { spanish: 'Aprendemos rápido.', russian: 'Мы быстро учимся.' },
          { spanish: '¿Vendéis libros?', russian: 'Вы продаёте книги?' },
        ],
      },
    ],
    practice: {
      tense: 'presente',
      persons: ALL_PERSONS,
      verbIds: ['comer', 'beber', 'aprender', 'vender', 'correr'],
      mode: 'input',
      maxQuestions: 10,
    },
  },
  {
    id: 'present-ir',
    order: 4,
    title: 'Правильные глаголы на -IR',
    subtitle: 'vivir и отличие от группы -ER',
    duration: '8 мин',
    sections: [
      {
        title: 'Окончания -IR',
        paragraphs: [
          'Уберите -ir. Для vivir: vivo, vives, vive, vivimos, vivís, viven.',
          'В настоящем времени формы -ER и -IR различаются только у nosotros и vosotros: comemos/coméis, но vivimos/vivís.',
        ],
        bullets: ['yo: -o', 'tú: -es', 'él/ella/usted: -e', 'nosotros/as: -imos', 'vosotros/as: -ís', 'ellos/ellas/ustedes: -en'],
      },
      {
        title: 'Примеры',
        paragraphs: ['Сначала закрепите окончания на правильных глаголах. Изменения корня появятся в следующем модуле.'],
        examples: [
          { spanish: 'Vivo en San Petersburgo.', russian: 'Я живу в Санкт-Петербурге.' },
          { spanish: 'Escribimos mucho.', russian: 'Мы много пишем.' },
          { spanish: 'Reciben el paquete.', russian: 'Они получают посылку.' },
        ],
      },
    ],
    practice: {
      tense: 'presente',
      persons: ALL_PERSONS,
      verbIds: ['vivir', 'escribir', 'abrir', 'recibir', 'decidir'],
      mode: 'input',
      maxQuestions: 10,
    },
  },
  {
    id: 'present-ser-estar',
    order: 5,
    title: 'Ser и estar',
    subtitle: 'Два «быть» без вредной формулы «навсегда / временно»',
    duration: '12 мин',
    sections: [
      {
        title: 'Спряжение',
        paragraphs: [
          'Оба глагола неправильные, поэтому формы нужно узнавать без попытки натянуть на них правильные окончания.',
        ],
        bullets: [
          'ser: soy, eres, es, somos, sois, son',
          'estar: estoy, estás, está, estamos, estáis, están',
        ],
      },
      {
        title: 'Когда нужен ser',
        paragraphs: [
          'Ser связывает предмет с его идентичностью, классом, происхождением, профессией, материалом или временем. События тоже локализуются через ser.',
        ],
        examples: [
          { spanish: 'Soy ruso.', russian: 'Я русский.' },
          { spanish: 'La mesa es de madera.', russian: 'Стол деревянный.' },
          { spanish: 'La reunión es en la oficina.', russian: 'Встреча проходит в офисе.', note: 'Место события — ser.' },
        ],
      },
      {
        title: 'Когда нужен estar',
        paragraphs: [
          'Estar описывает состояние или местонахождение человека и предмета. Это не просто «временно»: Madrid está en España — положение не временное, но всё равно estar.',
        ],
        examples: [
          { spanish: 'Estoy cansado.', russian: 'Я устал.' },
          { spanish: 'El libro está en la mesa.', russian: 'Книга лежит на столе.' },
          { spanish: 'Madrid está en España.', russian: 'Мадрид находится в Испании.' },
        ],
        warning: 'Формула «ser — навсегда, estar — временно» удобна ровно до первого настоящего предложения. Не учите её.',
      },
    ],
    practice: {
      tense: 'presente',
      persons: ALL_PERSONS,
      verbIds: ['ser', 'estar'],
      mode: 'input',
      maxQuestions: 10,
    },
  },
  {
    id: 'present-checkpoint',
    order: 6,
    title: 'Проверка: Presente I',
    subtitle: 'Смешайте три правильные модели с ser и estar',
    duration: '10 мин',
    sections: [
      {
        title: 'Перед проверкой',
        paragraphs: [
          'Здесь формы перемешаны. Уберите окончание инфинитива, определите группу и лицо; у ser и estar вспоминайте форму целиком.',
          'Для прохождения нужно не меньше 70%. Ошибки можно повторить отдельно.',
        ],
      },
    ],
    practice: {
      tense: 'presente',
      persons: ALL_PERSONS,
      verbIds: [
        'hablar',
        'trabajar',
        'estudiar',
        'comer',
        'beber',
        'aprender',
        'vivir',
        'escribir',
        'abrir',
        'ser',
        'estar',
      ],
      mode: 'input',
      maxQuestions: 20,
    },
  },
];

export const COURSE_LESSONS = PRESENT_MODULE_LESSONS;

export function getCourseLesson(id: string): CourseLesson | undefined {
  return COURSE_LESSONS.find(lesson => lesson.id === id);
}
