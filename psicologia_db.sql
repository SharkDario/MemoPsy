-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 18-06-2025 a las 18:09:13
-- Versión del servidor: 8.3.0
-- Versión de PHP: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `psicologia_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accion`
--

DROP TABLE IF EXISTS `accion`;
CREATE TABLE IF NOT EXISTS `accion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13140281 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `accion`
--

INSERT INTO `accion` (`id`, `nombre`) VALUES
(3, 'Editar'),
(5, 'Registrar'),
(11, 'Ver'),
(590, 'Eliminar'),
(13140280, 'Asignar');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ciudad`
--

DROP TABLE IF EXISTS `ciudad`;
CREATE TABLE IF NOT EXISTS `ciudad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `pais_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_factura`
--

DROP TABLE IF EXISTS `detalle_factura`;
CREATE TABLE IF NOT EXISTS `detalle_factura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `precio` decimal(10,2) NOT NULL,
  `sesion_id` int NOT NULL,
  `factura_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sesion_id` (`sesion_id`),
  KEY `factura_id` (`factura_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `domicilio`
--

DROP TABLE IF EXISTS `domicilio`;
CREATE TABLE IF NOT EXISTS `domicilio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `codigo_postal` varchar(20) DEFAULT NULL,
  `calle` varchar(100) DEFAULT NULL,
  `ciudad_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`),
  KEY `ciudad_id` (`ciudad_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

DROP TABLE IF EXISTS `estado`;
CREATE TABLE IF NOT EXISTS `estado` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`id`, `nombre`) VALUES
(4, 'Pendiente'),
(5, 'Cancelada'),
(6, 'Finalizada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

DROP TABLE IF EXISTS `factura`;
CREATE TABLE IF NOT EXISTS `factura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `fechaEmision` date NOT NULL,
  `tipo_factura_id` int NOT NULL,
  `medio_de_pago_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_factura_id` (`tipo_factura_id`),
  KEY `medio_de_pago_id` (`medio_de_pago_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe`
--

DROP TABLE IF EXISTS `informe`;
CREATE TABLE IF NOT EXISTS `informe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `psicologo_id` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `es_privado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `psicologo_id` (`psicologo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `informe`
--

INSERT INTO `informe` (`id`, `psicologo_id`, `titulo`, `contenido`, `fecha_creacion`, `es_privado`) VALUES
(1, 892, 'Nota SOAP - Aldo Ortega Meza - Sesión Inicial - Ansiedad Laboral', 'S: \"Aldo Ortega Meza, hombre de 38 años, reporta sentirse \'abrumado y constantemente tenso\' debido a la presión laboral y el temor a perder su empleo. Menciona dificultades para conciliar el sueño y despertares nocturnos (4-5 horas de sueño intermitente), así como irritabilidad creciente en casa. Refiere que la ansiedad se ha intensificado en los últimos dos meses, coincidiendo con cambios en la estructura de su empresa y la salida de colegas clave.\" \nO: \"Durante la sesión, el paciente mostró inquietud, movimientos constantes de piernas y dificultad para mantener el contacto visual prolongado (evitación de la mirada directa). Su discurso era rápido y en ocasiones entrecortado. Se observó sudoración en las manos y una postura encorvada. La Escala de Ansiedad de Hamilton (HARS) administrada arrojó una puntuación de 25, indicando ansiedad moderada a severa.\" \nA: \"Los síntomas de ansiedad de Aldo (tensión, insomnio, irritabilidad) parecen estar directamente relacionados con el estrés laboral y la incertidumbre profesional, con un componente significativo de ansiedad anticipatoria. Existe una correlación temporal clara con los recientes cambios organizacionales en su entorno laboral. Su estado actual sugiere un trastorno de ansiedad generalizada con componentes somáticos y cognitivos, afectando su funcionamiento interpersonal y calidad de vida.\"\nP: \"Se propondrá un plan de tratamiento enfocado en la terapia cognitivo-conductual (TCC) para abordar los patrones de pensamiento catastróficos y desarrollar estrategias de afrontamiento. Se programarán sesiones semanales durante los próximos 8-10 semanas. Se recomendará la práctica de técnicas de relajación y respiración como tarea entre sesiones. Evaluar la necesidad de derivación a psiquiatría si los síntomas no mejoran en 4 semanas o si se observa comorbilidad depresiva.\"', '2025-06-12 12:34:17', 1),
(2, 892, 'Nota SOAP - Aldo Ortega Meza - Progreso en Manejo del Estrés', 'S: \"Aldo reporta una ligera disminución en la intensidad de su ansiedad, \'ya no me siento tan al límite, aunque la presión sigue\'. Menciona haber logrado dormir 5-6 horas algunas noches, aunque los despertares persisten una o dos veces por semana. Ha practicado la respiración diafragmática que se le indicó (3-4 veces al día), notando una leve mejoría en momentos de tensión laboral específica. Sin embargo, aún percibe la presión laboral como alta y la comunicación con su jefe como deficiente.\"\nO: \"El paciente se mostró más relajado durante la sesión, con contacto visual más sostenido y menos movimientos de inquietud. Su ritmo de habla era más pausado y reflexivo. Se observó una menor agitación motora general. La re-aplicación de la HARS arrojó una puntuación de 20, indicando una leve mejoría clínica. Se mostró receptivo a discutir nuevas estrategias y a la exploración de sus patrones de afrontamiento.\"\nA: \"Aldo muestra un progreso inicial en el manejo de la ansiedad, evidenciado por la reducción subjetiva de la tensión y la mejora en la calidad del sueño, apoyado por la disminución en la HARS. La adherencia a las técnicas de relajación es un factor positivo y un buen indicador de compromiso terapéutico. Sin embargo, la fuente de estrés laboral sigue siendo un desafío significativo que requiere mayor abordaje, incluyendo habilidades de asertividad y reestructuración cognitiva de las demandas laborales.\"\nP: \"Continuar con TCC, enfocándose en reestructuración cognitiva para pensamientos relacionados con la autoexigencia y el control percibido sobre situaciones laborales. Introducir técnicas de mindfulness para la gestión del estrés agudo y la aceptación de la incertidumbre. Revisar y ajustar la rutina de sueño, incluyendo higiene del sueño. Establecer objetivos específicos para la próxima semana relacionados con la aplicación de técnicas en el entorno laboral y la identificación de límites personales. Próxima sesión en una semana.\"', '2025-06-12 15:48:12', 1),
(3, 892, 'Guía Rápida de Respiración para la Ansiedad - Aldo Ortega Meza', 'Estimado Aldo, como parte de nuestro trabajo para manejar la ansiedad, se comparte esta guía de ejercicios de respiración que se pueden practicar en cualquier momento y lugar para reducir la tensión. La respiración profunda ayuda al cuerpo a relajarse y disminuir la presión arterial y la frecuencia cardíaca, activando la respuesta de relajación.\n1. Respiración Abdominal (Diafragmática):\n* Cómo practicarla: Siéntese o acuéstese cómodamente. Coloque una mano sobre su abdomen, justo debajo de las costillas, y la otra sobre su pecho.\n* Inhale: Lentamente por la nariz, sintiendo cómo su abdomen se eleva. Su pecho no debería moverse.\n* Exhale: Lentamente por la boca, frunciendo los labios como si fuera a silbar. Sienta cómo su abdomen desciende y cómo expulsa todo el aire. \n* Frecuencia: Repita de 3 a 10 veces, tomándose su tiempo con cada respiración.\n2. Respiración 4-7-8: \n* Cómo practicarla: Siéntese o recuéstese. Puede colocar una mano sobre su abdomen.\n* Inhale: Profunda y lentamente por la nariz contando mentalmente hasta 4.\n* Contén: La respiración contando mentalmente hasta 7.\n* Exhala: Completamente por la boca, haciendo un suave sonido de \'shhh\', contando mentalmente hasta 8. Intente vaciar sus pulmones por completo.\n* Frecuencia: Repita 3 a 7 veces o hasta que se sienta tranquilo. \nRecuerde: Practique estos ejercicios diariamente, incluso cuando no se sienta ansioso. La práctica regular los convertirá en una herramienta más efectiva y accesible cuando más los necesite, ayudándole a recuperar la calma rápidamente.', '2025-06-12 18:09:07', 0),
(4, 892, 'Estrategias Prácticas para el Autocontrol Emocional - Aldo Ortega Meza', 'Aldo, para fortalecer su capacidad de manejar el estrés y la ansiedad, es fundamental desarrollar el autocontrol emocional. Aquí tiene algunas estrategias prácticas que puede aplicar en su día a día para mejorar su bienestar: \n1. Sea Consciente y Defina: El primer paso es identificar claramente qué pensamientos, comportamientos o hábitos quiere cambiar o mejorar. Reconozca las situaciones que le desestabilizan emocionalmente (ej. exceso de responsabilidad, pensamientos negativos anticipatorios sobre el trabajo). \n2. Tómese una Pausa Estratégica: Cuando se sienta abrumado o al borde de perder el control emocional, deténgase. Si es posible, salga de la situación o del lugar del conflicto por unos minutos. Utilice una técnica de respiración profunda (como las de la guía anterior) o una distracción saludable para calmarse antes de reaccionar impulsivamente. \n3. Distraerse Saludablemente: Busque activamente algo que le permita desconectar y centrar su mente en otra cosa cuando se sienta nervioso, estresado o sobrepasado. Puede ser leer un libro, hacer ejercicio, escuchar su música favorita, o salir a caminar. Elija su \'medicina\' personal para tranquilizarse. \n4. Practique Mindfulness (Atención Plena): Dedique unos minutos al día a la meditación basada en mindfulness. Concéntrese en su respiración y en las sensaciones de su cuerpo en el momento presente, sin juzgar sus pensamientos o emociones. Esto le ayudará a observar sus reacciones sin dejarse arrastrar por ellas y a desarrollar una actitud más abierta. \n5. Evalúese Constantemente y Ajuste: Una vez que logre tomar conciencia y reconocer sus reacciones, evalúe el impacto que tienen en usted y en los demás. Este proceso de mejora continua le permitirá ajustar sus estrategias y fortalecer su inteligencia emocional. \nRecuerde: El autocontrol es una habilidad que se desarrolla con la práctica y la paciencia. Sea amable consigo mismo durante este proceso y celebre cada pequeño avance en su camino hacia un mayor bienestar.', '2025-06-12 18:10:33', 0),
(5, 892, 'Nota SOAP - Diana Coronel - Estrés Postraumático', 'S: \"Diana Coronel, mujer de 32 años, reporta que los pensamientos intrusivos y flashbacks relacionados con el incidente traumático (accidente de tráfico hace 8 meses) han disminuido en frecuencia (de 5-6 a 2-3 veces por semana), pero persisten en momentos de estrés o al escuchar ruidos fuertes. Menciona que ha logrado dormir 4-5 horas seguidas algunas noches, lo cual es una mejora respecto a las 2-3 horas iniciales. Sin embargo, aún evita conducir por avenidas principales y autopistas, lo que limita su autonomía.\" \nO: \"Durante la sesión, la paciente se mostró menos tensa que en sesiones anteriores, aunque aún se observó cierta rigidez corporal y evitación de la mirada al hablar del incidente. Mantuvo el contacto visual de manera más consistente en otros temas. Los resultados de la Escala de Gravedad de Síntomas del TEPT (EGS-TEPT) mostraron una reducción de 3 puntos (de 30 a 27) respecto a la evaluación inicial, indicando una leve mejoría en los síntomas de re-experimentación y evitación, pero aún en rango clínico significativo.\"\nA: \"Diana presenta una mejora gradual en los síntomas de TEPT, probablemente debido a la aplicación de técnicas de regulación emocional y la iniciación de exposición gradual. La persistencia de la evitación de la conducción y los flashbacks residuales indican que esta es un área clave para futuras intervenciones y que el procesamiento del trauma aún no está completo. La mejora en el sueño es un indicador positivo de reducción de la hiperactivación fisiológica y un buen pronóstico para la continuación del tratamiento.\"\nP: \"Continuar con terapia de exposición gradual (exposición en imaginación y en vivo) para la evitación de la conducción, comenzando con rutas de baja intensidad. Reforzar técnicas de mindfulness y relajación para manejar los pensamientos intrusivos residuales y la ansiedad anticipatoria. Explorar estrategias adicionales para mejorar aún más la calidad del sueño, como la higiene del sueño. Próxima sesión en una semana para revisar el progreso y establecer nuevas tareas de exposición.\"', '2025-06-12 19:05:15', 1),
(6, 892, 'Nota SOAP - Diana Coronel - Avance en Regulación Emocional', 'S: \"Diana reporta sentirse \'más en control\' de sus emociones y que los flashbacks son ahora \'raros y menos intensos\'. Ha logrado identificar y detener pensamientos intrusivos con mayor facilidad, utilizando la técnica de redirección de atención. Menciona que la calidad de su sueño ha mejorado significativamente, durmiendo 6-7 horas la mayoría de las noches. Ha conducido por avenidas principales en dos ocasiones esta semana, experimentando ansiedad pero logrando manejarla con las técnicas aprendidas y sin evitar la ruta.\"\nO: \"La paciente se mostró tranquila, asertiva y con un afecto adecuado durante la sesión. Su discurso era coherente y organizado, con una notable reducción de la evitación del tema traumático. No se observaron signos de tensión física. La EGS-TEPT mostró una reducción adicional (de 27 a 15), situándose por debajo del umbral clínico para TEPT. Se mostró motivada para continuar con los desafíos de exposición y explorar nuevos objetivos personales.\" \nA: \"Diana ha logrado avances significativos en la regulación emocional y en la superación de la evitación asociada al trauma. La combinación de reestructuración cognitiva, exposición gradual y técnicas de mindfulness ha sido altamente efectiva en la reducción de sus síntomas de TEPT. Ha desarrollado una mayor autoeficacia en el manejo de sus síntomas y ha recuperado áreas importantes de su funcionamiento. Se considera que ha alcanzado los objetivos terapéuticos primarios establecidos.\" \nP: \"Se propondrá una fase de mantenimiento, con sesiones quincenales durante un mes, luego mensuales durante dos meses, para consolidar las habilidades aprendidas y prevenir recaídas. Se recomendará mantener un diario de emociones y seguir practicando las técnicas de relajación y mindfulness de forma autónoma. Discutir planes para la alta terapéutica y explorar objetivos de crecimiento personal en las próximas sesiones.\"', '2025-06-12 19:07:05', 1),
(7, 892, 'Guía para el Manejo de Pensamientos Intrusivos - Diana Coronel', 'Estimada Diana, como se ha conversado en nuestras sesiones, los pensamientos intrusivos son comunes y no definen su realidad. Aquí se presenta una guía con estrategias prácticas para ayudarle a manejarlos de manera efectiva y reducir su impacto en su bienestar: \n1. Reconozca y Etiquete: Cuando aparezca un pensamiento intrusivo, obsérvelo sin juzgarlo. Puede decirse a sí misma: \'Esto es un pensamiento intrusivo, no una realidad.\' Reconocerlo es el primer paso para quitarle poder. \n2. No Luche contra Ellos: Intentar suprimir o luchar contra los pensamientos a menudo los hace más fuertes y persistentes. En lugar de luchar, permítales estar, como si fueran nubes que pasan por el cielo. Simplemente obsérvelos y déjelos ir. \n3. Distancia Cognitiva: Imagine el pensamiento como un objeto externo a usted. Puede visualizarlo escrito en una hoja que se la lleva el viento, o en una burbuja que flota y se aleja. Esta técnica le ayuda a crear una distancia saludable del pensamiento.\n4. Redirija su Atención: Una vez que haya reconocido el pensamiento intrusivo, redirija activamente su atención a una actividad o a sus sentidos (lo que ve, oye, huele, siente en el momento presente). Puede usar una técnica de respiración 5 o concentrarse intensamente en una tarea que requiera su atención. \n5. Establezca un \'Tiempo de Preocupación\': Si los pensamientos son recurrentes y le abruman, puede asignar un momento específico del día (ej. 15-20 minutos por la tarde) para \'preocuparse\'. Si aparecen fuera de ese tiempo, anótelos brevemente y pospóngalos para su \'tiempo de preocupación\' designado.\nRecuerde: La práctica constante de estas técnicas le ayudará a reducir el impacto de los pensamientos intrusivos en su bienestar y a recuperar un mayor control sobre su mente.', '2025-06-12 19:10:22', 0),
(8, 892, 'Técnicas de Relajación Profunda para la Calma - Diana Coronel', 'Diana, para complementar su proceso terapéutico y ayudarle a manejar el estrés, la ansiedad y mejorar la calidad de su sueño, se recomienda practicar regularmente estas técnicas de relajación profunda. La constancia es clave para que sean más efectivas:\n1. Meditación Guiada (Mindfulness): Dedique 10-15 minutos al día a practicar mindfulness. Puede encontrar audios guiados en línea o usar aplicaciones. Concéntrese en su respiración y en las sensaciones de su cuerpo en el momento presente, permitiendo que los pensamientos pasen sin juzgar. Esto le ayudará a estar más presente, a reducir la rumiación y a cultivar una actitud de aceptación. \n2. Relajación Muscular Progresiva (RMP): \n* Preparación: Siéntese o acuéstese cómodamente en un lugar tranquilo. \n* Proceso: Comience por los pies: tense los músculos de los dedos de los pies con fuerza por 5 segundos, luego relájelos completamente por 15 segundos, notando la diferencia entre tensión y relajación. \n* Continuación: Continúe subiendo por el cuerpo, tensando y relajando cada grupo muscular principal (piernas, glúteos, abdomen, brazos, manos, hombros, cuello, cara). \n* Beneficio: Esta técnica le ayuda a reconocer y liberar la tensión física acumulada en su cuerpo. \n3. Yoga o Tai Chi Suave: Considere incorporar la práctica de yoga o Tai Chi en su rutina. Estas disciplinas ancestrales combinan posturas físicas suaves con respiración enfocada y meditación, promoviendo la fuerza, flexibilidad y una profunda relajación mental y corporal. Busque clases para principiantes que se adapten a su nivel. \nRecuerde: La integración de estas prácticas en su rutina diaria le ayudará a construir una base sólida de calma y bienestar, mejorando su capacidad de afrontamiento ante el estrés.\n', '2025-06-12 19:12:48', 0),
(9, 892, 'Nota SOAP - Terapia de Pareja - Jorge Galvaliz y Diana Coronel - Comunicación', 'S: \"Jorge (40 años) y Diana (32 años) reportan dificultades significativas en la comunicación, especialmente en la gestión de desacuerdos sobre la crianza de Sabrina (7 años) y las finanzas. Jorge menciona sentirse \'ignorado y desvalorizado\' cuando intenta expresar su punto de vista, mientras Diana refiere que Jorge \'siempre interrumpe\' y \'no escucha realmente\', lo que la lleva a cerrarse. Ambos expresan frustración por la recurrencia y escalada de las discusiones, que a menudo terminan sin resolución.\" \nO: \"Durante la sesión, se observaron patrones de interrupción frecuentes por parte de Jorge y expresiones faciales de frustración y resignación en Diana. Ambos mostraron dificultad para practicar la escucha activa, tendiendo a formular su respuesta mientras el otro hablaba, lo que generaba un diálogo paralelo en lugar de una conversación. Hubo momentos de escalada emocional (tono de voz elevado, lenguaje corporal defensivo) que requirieron intervención activa del terapeuta para redirigir la conversación. Se les pidió describir un conflicto reciente, y sus narrativas eran inconsistentes en detalles clave y atribución de intenciones.\" \nA: \"La pareja presenta un patrón de comunicación disfuncional caracterizado por interrupciones, falta de escucha activa, atribuciones negativas y escalada emocional. Esto impacta negativamente la resolución de conflictos y la conexión emocional. Existe una brecha en la percepción mutua de las interacciones y una tendencia a la evitación de temas difíciles. La dinámica sugiere la necesidad urgente de psicoeducación en habilidades de comunicación asertiva, escucha activa y validación emocional, así como la identificación de ciclos negativos de interacción.\" \nP: \"Se introducirán técnicas de escucha activa y validación emocional. Se asignará una tarea de \'cita de comunicación\' semanal de 20 minutos para practicar estas habilidades en un entorno estructurado y seguro. Se explorarán las expectativas individuales sobre la comunicación en la relación y los \'puntos ciegos\' en su interacción. Próxima sesión en una semana para revisar la tarea y profundizar en la identificación de patrones de escalada y desescalada.\"', '2025-06-12 19:59:41', 1),
(10, 892, 'Nota SOAP - Terapia Familiar - Jorge, Diana y Sabrina - Dinámica Familiar', 'S: \"Jorge y Diana reportan que las discusiones de pareja han disminuido en frecuencia e intensidad, pero Sabrina (7 años) ha mostrado \'más rabietas\', \'dificultad para dormir\' (resistencia a acostarse, despertares nocturnos) y \'comportamientos regresivos\' (mojar la cama ocasionalmente) en las últimas semanas. Diana menciona que Sabrina ha preguntado si \'mamá y papá se van a separar\' después de presenciar una discusión. Jorge expresa profunda preocupación por el impacto en su hija y reconoce que aún les cuesta mantener la calma en momentos de desacuerdo frente a Sabrina.\"\nO: \"Durante la sesión conjunta con Sabrina, la niña se mostró inicialmente retraída y ansiosa, luego exhibió comportamientos de búsqueda de atención (interrupciones, quejas, hablar en voz alta). Se observó que Jorge y Diana tendían a corregir a Sabrina de forma inconsistente y a veces contradictoria. Cuando se les pidió discutir un tema neutral, la pareja mostró una mejora en la escucha, pero la tensión era palpable al abordar temas relacionados con la crianza o el manejo del tiempo libre. Sabrina dibujó una familia con figuras distantes y una figura pequeña llorando.\" \nA: \"La mejora en la comunicación de la pareja no se ha traducido completamente en una reducción del impacto en Sabrina. La niña está manifestando la tensión parental y la inconsistencia en la crianza a través de síntomas conductuales y emocionales (rabietas, problemas de sueño, ansiedad por separación, regresión). La percepción de conflicto parental y la falta de un frente unido en la crianza están afectando su seguridad emocional y desarrollo. Es crucial integrar a Sabrina más activamente en el proceso psicoeducativo sobre la expresión emocional y la seguridad familiar, y establecer límites parentales claros y consistentes.\" \nP: \"Se implementará psicoeducación para los padres sobre el impacto del conflicto parental en los hijos y estrategias de co-parenting (ej. \'frente unido\'). Se establecerán límites claros y consistentes para Sabrina y se reforzará una rutina de sueño. Se enseñarán a Jorge y Diana técnicas para manejar los desacuerdos fuera de la presencia de Sabrina o de manera constructiva. Se considerará una sesión de juego terapéutico con Sabrina para explorar sus emociones y fortalecer su sentido de seguridad. Próxima sesión en una semana, enfocada en estrategias de co-parenting y manejo de límites con Sabrina.\"', '2025-06-12 20:00:38', 1),
(11, 892, 'Guía para una Comunicación Efectiva en Pareja - Jorge y Diana', 'Estimados Jorge y Diana, una comunicación sana y efectiva es el pilar de una relación fuerte y satisfactoria. Aquí se comparten herramientas clave para mejorar su interacción y construir un diálogo más constructivo: \n1. Escucha Activa: Presten atención completa cuando el otro hable, sin interrumpir, juzgar o planear su respuesta. Hagan preguntas aclaratorias para asegurarse de que han entendido correctamente y parafraseen lo que escucharon para demostrar comprensión y validar los sentimientos. Mantengan contacto visual y una postura abierta que invite a la confianza. \n2. Validación Emocional: Reconozcan y expresen que los sentimientos del otro son válidos y comprensibles, incluso si no están de acuerdo con la situación o el punto de vista. Frases como \'Entiendo que te sientas frustrada/o por...\' o \'Tiene sentido que te sientas así\' son muy útiles para crear un espacio seguro.\n3. Eviten la Culpa y el Reproche: Cuando surjan desacuerdos, céntrense en el problema o la situación, no en atacarse mutuamente. Utilicen \'mensajes yo\' (\'Yo me siento...\' en lugar de \'Tú siempre...\') para expresar sus necesidades y sentimientos de manera asertiva. \n4. Tómense un Descanso si es Necesario: Si una discusión se vuelve demasiado intensa o sienten que están perdiendo el control, es válido y saludable pausar. Acuerden un tiempo (ej. 20-30 minutos) para calmarse individualmente y retomen la conversación cuando ambos estén más serenos y listos para un diálogo constructivo. \n5. Programen \'Citas de Comunicación\' Regulares: Dediquen momentos específicos y libres de distracciones (ej. una vez a la semana) para hablar sobre su relación, sus necesidades, y cualquier tema importante. Creen un espacio seguro donde ambos se sientan cómodos y libres de interrupciones. \nRecuerden: La práctica constante, la paciencia y la empatía son esenciales para transformar sus patrones de comunicación. Cada conversación es una oportunidad para fortalecer su conexión y comprensión mutua.', '2025-06-12 20:01:32', 0),
(12, 892, 'Pautas para el Manejo de Conflictos Familiares - Jorge, Diana y Sabrina', 'Queridos Jorge y Diana, y también para nuestra querida Sabrina, los conflictos son una parte natural de cualquier familia, pero la forma en que los manejamos hace una gran diferencia en el bienestar de todos. Aquí tienen algunas pautas prácticas para que su hogar sea un lugar más armonioso y seguro para expresar emociones: \n1. Regla de Oro: Hablar con Respeto: Es fundamental que todos en la familia, incluidos los adultos, practiquen hablar con respeto, incluso cuando estén en desacuerdo. Sin gritos, sin insultos, y sin descalificaciones. Modele este comportamiento para Sabrina. \n2. Escuchar para Entender, No Solo para Responder: Antes de responder, tómense un momento para realmente escuchar lo que el otro (incluida Sabrina) está diciendo y sintiendo. Intente ponerse en su lugar. \n3. Tiempo Fuera para Calmarse: Si una discusión se pone muy difícil o sienten que la tensión aumenta, cualquiera puede pedir un \'tiempo fuera\' para calmarse. Es importante que todos respeten esta señal. Una vez calmados, se retoma la conversación de manera más tranquila. \n4. Buscar Soluciones Juntos: En lugar de buscar culpables, concéntrense en buscar soluciones. Pregúntense: \'¿Cómo podemos resolver esto juntos?\' Involucren a Sabrina en la búsqueda de soluciones adecuadas a su edad para los problemas que la conciernen, fomentando su sentido de agencia. \n5. Validar los Sentimientos de Sabrina: Cuando Sabrina exprese frustración, tristeza o miedo por un conflicto, validen sus sentimientos. Frases como \'Entiendo que te sientas triste cuando mamá y papá discuten\' o \'Es normal sentirse así\' le enseñan que sus emociones son importantes y que es seguro expresarlas. \n6. Mostrar Aprecio y Gratitud: La terapia de pareja enfatiza la importancia de la reafirmación positiva. Expresen gratitud y aprecio por los esfuerzos y gestos del otro, y ofrezcan elogios y refuerzos positivos. Esto es crucial para fortalecer la conexión y la resiliencia de la relación. \nRecuerden: La familia es un equipo. Al practicar estas pautas, construirán un ambiente donde todos se sientan escuchados, valorados y seguros para crecer juntos.', '2025-06-12 20:03:54', 0),
(13, 893, 'Nota SOAP - Dionela Villalba - Ansiedad Laboral', 'S: \"Dionela Villalba, mujer de 35 años, reporta sentirse \'abrumado y constantemente tenso\' debido a la presión laboral y el temor a perder su empleo. Menciona dificultades para conciliar el sueño y despertares nocturnos (4-5 horas de sueño intermitente), así como irritabilidad creciente en casa. Refiere que la ansiedad se ha intensificado en los últimos dos meses, coincidiendo con cambios en la estructura de su empresa y la salida de colegas clave.\" \nO: \"Durante la sesión, el paciente mostró inquietud, movimientos constantes de piernas y dificultad para mantener el contacto visual prolongado (evitación de la mirada directa). Su discurso era rápido y en ocasiones entrecortado. Se observó sudoración en las manos y una postura encorvada. La Escala de Ansiedad de Hamilton (HARS) administrada arrojó una puntuación de 25, indicando ansiedad moderada a severa.\" \nA: \"Los síntomas de ansiedad de Aldo (tensión, insomnio, irritabilidad) parecen estar directamente relacionados con el estrés laboral y la incertidumbre profesional, con un componente significativo de ansiedad anticipatoria. Existe una correlación temporal clara con los recientes cambios organizacionales en su entorno laboral. Su estado actual sugiere un trastorno de ansiedad generalizada con componentes somáticos y cognitivos, afectando su funcionamiento interpersonal y calidad de vida.\"\nP: \"Se propondrá un plan de tratamiento enfocado en la terapia cognitivo-conductual (TCC) para abordar los patrones de pensamiento catastróficos y desarrollar estrategias de afrontamiento. Se programarán sesiones semanales durante los próximos 8-10 semanas. Se recomendará la práctica de técnicas de relajación y respiración como tarea entre sesiones. Evaluar la necesidad de derivación a psiquiatría si los síntomas no mejoran en 4 semanas o si se observa comorbilidad depresiva.\"\n', '2025-06-12 22:12:49', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medio_de_pago`
--

DROP TABLE IF EXISTS `medio_de_pago`;
CREATE TABLE IF NOT EXISTS `medio_de_pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modalidad`
--

DROP TABLE IF EXISTS `modalidad`;
CREATE TABLE IF NOT EXISTS `modalidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `modalidad`
--

INSERT INTO `modalidad` (`id`, `nombre`) VALUES
(3, 'Presencial'),
(4, 'Remota');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modulo`
--

DROP TABLE IF EXISTS `modulo`;
CREATE TABLE IF NOT EXISTS `modulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `modulo`
--

INSERT INTO `modulo` (`id`, `nombre`) VALUES
(3, 'Informes'),
(5, 'Usuarios'),
(10, 'Perfiles'),
(17, 'Sesiones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obra_social`
--

DROP TABLE IF EXISTS `obra_social`;
CREATE TABLE IF NOT EXISTS `obra_social` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `obra_social`
--

INSERT INTO `obra_social` (`id`, `nombre`, `activo`) VALUES
(1, 'IASEP', 1),
(2, 'OSJERA', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

DROP TABLE IF EXISTS `paciente`;
CREATE TABLE IF NOT EXISTS `paciente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL,
  `obra_social_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`),
  KEY `obra_social_id` (`obra_social_id`)
) ENGINE=InnoDB AUTO_INCREMENT=390 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`id`, `persona_id`, `obra_social_id`) VALUES
(385, 9, 1),
(386, 5911701, 2),
(387, 5911702, 1),
(388, 3, 2),
(389, 5911703, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_tiene_informe`
--

DROP TABLE IF EXISTS `paciente_tiene_informe`;
CREATE TABLE IF NOT EXISTS `paciente_tiene_informe` (
  `informe_id` int NOT NULL,
  `paciente_id` int NOT NULL,
  PRIMARY KEY (`informe_id`,`paciente_id`),
  KEY `fk_informe_has_paciente_paciente1_idx` (`paciente_id`),
  KEY `fk_informe_has_paciente_informe1_idx` (`informe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `paciente_tiene_informe`
--

INSERT INTO `paciente_tiene_informe` (`informe_id`, `paciente_id`) VALUES
(1, 385),
(2, 385),
(3, 385),
(4, 385),
(5, 386),
(6, 386),
(7, 386),
(8, 386),
(9, 386),
(10, 386),
(11, 386),
(12, 386),
(9, 387),
(10, 387),
(11, 387),
(12, 387),
(13, 388);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_tiene_sesion`
--

DROP TABLE IF EXISTS `paciente_tiene_sesion`;
CREATE TABLE IF NOT EXISTS `paciente_tiene_sesion` (
  `sesion_id` int NOT NULL,
  `paciente_id` int NOT NULL,
  PRIMARY KEY (`sesion_id`,`paciente_id`),
  KEY `fk_sesion_has_paciente_paciente1_idx` (`paciente_id`),
  KEY `fk_sesion_has_paciente_sesion1_idx` (`sesion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `paciente_tiene_sesion`
--

INSERT INTO `paciente_tiene_sesion` (`sesion_id`, `paciente_id`) VALUES
(8, 385),
(9, 386),
(10, 386),
(12, 386),
(13, 386),
(14, 386),
(12, 387),
(13, 387),
(14, 387),
(11, 388);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pais`
--

DROP TABLE IF EXISTS `pais`;
CREATE TABLE IF NOT EXISTS `pais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil`
--

DROP TABLE IF EXISTS `perfil`;
CREATE TABLE IF NOT EXISTS `perfil` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `perfil`
--

INSERT INTO `perfil` (`id`, `nombre`, `descripcion`) VALUES
(8, 'Administrador', 'Administrador con todos los permisos'),
(9, 'Psicólogo', 'Informes y Sesiones propias'),
(12, 'Paciente', 'Puede visualizar informes de recordatorios proporcionados por sus psicólogos, así como visualizar sus sesiones programadas.'),
(13, 'Recepcionista', 'Puede visualizar las sesiones, editarlas y asignarlas a Psicólogos y Pacientes.'),
(15, 'Supervisor', 'supervisa psicologos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfil_tiene_permiso`
--

DROP TABLE IF EXISTS `perfil_tiene_permiso`;
CREATE TABLE IF NOT EXISTS `perfil_tiene_permiso` (
  `perfil_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  PRIMARY KEY (`perfil_id`,`permiso_id`),
  KEY `permiso_id` (`permiso_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `perfil_tiene_permiso`
--

INSERT INTO `perfil_tiene_permiso` (`perfil_id`, `permiso_id`) VALUES
(8, 3),
(9, 3),
(12, 3),
(15, 3),
(8, 5),
(8, 6),
(15, 6),
(8, 7),
(8, 11),
(13, 11),
(15, 11),
(8, 20),
(8, 37),
(8, 49),
(13, 49),
(8, 784),
(8, 7723),
(9, 13483),
(8, 93330),
(13, 93330),
(8, 773410),
(8, 773411),
(9, 773412),
(8, 773414),
(9, 773414),
(12, 773414),
(13, 773414),
(8, 773415),
(13, 773415);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permiso`
--

DROP TABLE IF EXISTS `permiso`;
CREATE TABLE IF NOT EXISTS `permiso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `modulo_id` int NOT NULL,
  `accion_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `modulo_id` (`modulo_id`),
  KEY `accion_id` (`accion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=773416 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `permiso`
--

INSERT INTO `permiso` (`id`, `nombre`, `descripcion`, `modulo_id`, `accion_id`) VALUES
(3, 'Ver Informes', 'Ver la lista de informes de pacientes', 3, 11),
(5, 'Editar Perfil', 'Editar un perfil', 10, 3),
(6, 'Asignar Perfil', 'Asignar un perfil a un Usuario', 10, 13140280),
(7, 'Ver Perfiles', 'Ver la lista de perfiles', 10, 11),
(11, 'Editar Sesión', 'Editar una sesión programada', 17, 3),
(20, 'Eliminar Perfil', 'Eliminar un perfil', 10, 590),
(37, 'Registrar Usuario', 'Registrar un nuevo usuario', 5, 5),
(49, 'Registrar Sesión', 'Registrar una nueva sesión con un paciente', 17, 5),
(784, 'Editar Usuario', 'Editar los datos de un usuario', 5, 3),
(7723, 'Ver Usuarios', 'Ver la lista de usuarios', 5, 11),
(13483, 'Registrar Informe', 'Registrar un nuevo informe de paciente', 3, 5),
(93330, 'Eliminar Sesión', 'Eliminar una sesión programada', 17, 590),
(773410, 'Registrar Perfil', 'Registrar un nuevo perfil', 10, 5),
(773411, 'Eliminar Usuario', 'Eliminar un usuario', 5, 590),
(773412, 'Editar Informe', 'Editar un informe de paciente', 3, 3),
(773413, 'Eliminar Informe', 'Eliminar un informe de paciente', 3, 590),
(773414, 'Ver Sesiones', 'Ver la lista de sesiones programadas', 17, 11),
(773415, 'Asignar Profesional', 'Asignar un profesional a una sesión', 17, 13140280);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

DROP TABLE IF EXISTS `persona`;
CREATE TABLE IF NOT EXISTS `persona` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5911704 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`id`, `nombre`, `apellido`, `dni`, `fecha_nacimiento`) VALUES
(3, 'Dionela', 'Villalba', '74748484', '1999-05-25'),
(6, 'Dario', 'Coronel', '10000000', '1998-08-06'),
(9, 'Aldo', 'Ortega Meza', '44058787', '1999-11-12'),
(5911700, 'Azul', 'Coronel', '45451212', '2003-08-05'),
(5911701, 'Diana', 'Coronel', '33897845', '1995-10-08'),
(5911702, 'Jorge', 'Galvaliz', '48987845', '1992-06-12'),
(5911703, 'Javier', 'Diaz', '78795120', '1999-06-01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona_tiene_factura`
--

DROP TABLE IF EXISTS `persona_tiene_factura`;
CREATE TABLE IF NOT EXISTS `persona_tiene_factura` (
  `persona_id` int NOT NULL,
  `factura_id` int NOT NULL,
  PRIMARY KEY (`persona_id`,`factura_id`),
  KEY `fk_persona_has_factura_factura1_idx` (`factura_id`),
  KEY `fk_persona_has_factura_persona1_idx` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `psicologo`
--

DROP TABLE IF EXISTS `psicologo`;
CREATE TABLE IF NOT EXISTS `psicologo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `numero_licencia` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`)
) ENGINE=InnoDB AUTO_INCREMENT=894 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `psicologo`
--

INSERT INTO `psicologo` (`id`, `persona_id`, `especialidad`, `numero_licencia`) VALUES
(892, 5911700, 'infantil', '1213'),
(893, 5911701, 'adultos', '8488');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion`
--

DROP TABLE IF EXISTS `sesion`;
CREATE TABLE IF NOT EXISTS `sesion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `psicologo_id` int NOT NULL,
  `fecha_hora_inicio` datetime NOT NULL,
  `fecha_hora_fin` datetime DEFAULT NULL,
  `modalidad_id` int NOT NULL,
  `estado_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `psicologo_id` (`psicologo_id`),
  KEY `modalidad_id` (`modalidad_id`),
  KEY `estado_id` (`estado_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sesion`
--

INSERT INTO `sesion` (`id`, `psicologo_id`, `fecha_hora_inicio`, `fecha_hora_fin`, `modalidad_id`, `estado_id`) VALUES
(8, 892, '2025-06-13 09:00:00', '2025-06-13 10:00:00', 3, 6),
(9, 892, '2025-06-13 13:00:00', '2025-06-13 15:00:00', 4, 4),
(10, 892, '2025-06-12 09:00:00', '2025-06-12 10:00:00', 4, 4),
(11, 893, '2025-06-14 09:00:00', '2025-06-14 10:00:00', 3, 4),
(12, 892, '2025-06-14 13:00:00', '2025-06-14 14:00:00', 3, 4),
(13, 892, '2025-06-16 09:00:00', '2025-06-16 10:00:00', 3, 4),
(14, 892, '2025-06-15 09:00:00', '2025-06-15 10:00:00', 3, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telefono`
--

DROP TABLE IF EXISTS `telefono`;
CREATE TABLE IF NOT EXISTS `telefono` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL,
  `numero` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `persona_id` (`persona_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_factura`
--

DROP TABLE IF EXISTS `tipo_factura`;
CREATE TABLE IF NOT EXISTS `tipo_factura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `ultimo_acceso` datetime DEFAULT NULL,
  `auth0Id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `auth0Id` (`auth0Id`),
  KEY `persona_id` (`persona_id`)
) ENGINE=InnoDB AUTO_INCREMENT=356446 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `persona_id`, `email`, `password`, `activo`, `ultimo_acceso`, `auth0Id`) VALUES
(25833, 5911700, 'azul@gmail.com', '$2b$12$ga0rFNDj0Wu2IR4AjZcc.u1ysGn6wL41QjcGrux6NB9BMQvaCEtAG', 0, '2025-06-13 13:18:37', NULL),
(356432, 6, 'mdarioc1998@gmail.com', '$2b$10$ZSP5XIVHVSH8qCALdoiBIe0KP2SsH8kQ/KGFOspnsgDtAqKdAFtLi', 1, '2025-06-13 13:11:39', 'auth0|684c2d3776f59c7dcff28896'),
(356441, 9, 'aldo@gmail.com', '$2b$10$25rDE/PmGD3ON7G9DIjGAu0FueLiV0L5Lwpc4DjUgtNaaIefZq1Wy', 1, '2025-06-13 13:37:10', NULL),
(356442, 3, 'dionela@gmail.com', '$2b$12$bfU05rbrIhgDM.R4ra9NrOaEMmx31ogK8gxpixT/WgnTu8Gk51qTS', 1, '2025-06-10 15:13:23', NULL),
(356443, 5911701, 'diana@gmail.com', '$2b$12$7hxRmznh4fYGQ0vPElrhb.rsDgTz/Z/3Y.KGjXHqHrUb8gYPHYaz2', 1, '2025-06-12 22:11:36', NULL),
(356444, 5911702, 'jorge@gmail.com', '$2b$12$Vb0/rpD5SAqaCsHUAC8MYefY9Xv45Ho95NcRoq16.3spT6cm2uxv6', 1, '2025-06-12 17:43:03', NULL),
(356445, 5911703, 'javier@gmail.com', '$2b$12$bJRV16IL67USDugOuHu1E.MnkJC1WeQ3YbmwNXi8N.lRrLXSIBBjG', 1, '2025-06-13 13:15:02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_tiene_perfil`
--

DROP TABLE IF EXISTS `usuario_tiene_perfil`;
CREATE TABLE IF NOT EXISTS `usuario_tiene_perfil` (
  `usuario_id` int NOT NULL,
  `perfil_id` int NOT NULL,
  PRIMARY KEY (`usuario_id`,`perfil_id`),
  KEY `perfil_id` (`perfil_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuario_tiene_perfil`
--

INSERT INTO `usuario_tiene_perfil` (`usuario_id`, `perfil_id`) VALUES
(356432, 8),
(356445, 8),
(25833, 9),
(356443, 9),
(356441, 12),
(356442, 12),
(356444, 12),
(356445, 12);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ciudad`
--
ALTER TABLE `ciudad`
  ADD CONSTRAINT `ciudad_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `pais` (`id`);

--
-- Filtros para la tabla `detalle_factura`
--
ALTER TABLE `detalle_factura`
  ADD CONSTRAINT `detalle_factura_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `sesion` (`id`),
  ADD CONSTRAINT `detalle_factura_ibfk_2` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`id`);

--
-- Filtros para la tabla `domicilio`
--
ALTER TABLE `domicilio`
  ADD CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `domicilio_ibfk_2` FOREIGN KEY (`ciudad_id`) REFERENCES `ciudad` (`id`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`tipo_factura_id`) REFERENCES `tipo_factura` (`id`),
  ADD CONSTRAINT `factura_ibfk_3` FOREIGN KEY (`medio_de_pago_id`) REFERENCES `medio_de_pago` (`id`);

--
-- Filtros para la tabla `informe`
--
ALTER TABLE `informe`
  ADD CONSTRAINT `informe_ibfk_1` FOREIGN KEY (`psicologo_id`) REFERENCES `psicologo` (`id`);

--
-- Filtros para la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `paciente_ibfk_2` FOREIGN KEY (`obra_social_id`) REFERENCES `obra_social` (`id`);

--
-- Filtros para la tabla `paciente_tiene_informe`
--
ALTER TABLE `paciente_tiene_informe`
  ADD CONSTRAINT `fk_informe_has_paciente_informe1` FOREIGN KEY (`informe_id`) REFERENCES `informe` (`id`),
  ADD CONSTRAINT `fk_informe_has_paciente_paciente1` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id`);

--
-- Filtros para la tabla `paciente_tiene_sesion`
--
ALTER TABLE `paciente_tiene_sesion`
  ADD CONSTRAINT `fk_sesion_has_paciente_paciente1` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id`),
  ADD CONSTRAINT `fk_sesion_has_paciente_sesion1` FOREIGN KEY (`sesion_id`) REFERENCES `sesion` (`id`);

--
-- Filtros para la tabla `perfil_tiene_permiso`
--
ALTER TABLE `perfil_tiene_permiso`
  ADD CONSTRAINT `perfil_tiene_permiso_ibfk_1` FOREIGN KEY (`perfil_id`) REFERENCES `perfil` (`id`),
  ADD CONSTRAINT `perfil_tiene_permiso_ibfk_2` FOREIGN KEY (`permiso_id`) REFERENCES `permiso` (`id`);

--
-- Filtros para la tabla `permiso`
--
ALTER TABLE `permiso`
  ADD CONSTRAINT `permiso_ibfk_1` FOREIGN KEY (`modulo_id`) REFERENCES `modulo` (`id`),
  ADD CONSTRAINT `permiso_ibfk_2` FOREIGN KEY (`accion_id`) REFERENCES `accion` (`id`);

--
-- Filtros para la tabla `persona_tiene_factura`
--
ALTER TABLE `persona_tiene_factura`
  ADD CONSTRAINT `fk_persona_has_factura_factura1` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`id`),
  ADD CONSTRAINT `fk_persona_has_factura_persona1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`);

--
-- Filtros para la tabla `psicologo`
--
ALTER TABLE `psicologo`
  ADD CONSTRAINT `psicologo_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`);

--
-- Filtros para la tabla `sesion`
--
ALTER TABLE `sesion`
  ADD CONSTRAINT `sesion_ibfk_1` FOREIGN KEY (`psicologo_id`) REFERENCES `psicologo` (`id`),
  ADD CONSTRAINT `sesion_ibfk_3` FOREIGN KEY (`modalidad_id`) REFERENCES `modalidad` (`id`),
  ADD CONSTRAINT `sesion_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `estado` (`id`);

--
-- Filtros para la tabla `telefono`
--
ALTER TABLE `telefono`
  ADD CONSTRAINT `telefono_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`);

--
-- Filtros para la tabla `usuario_tiene_perfil`
--
ALTER TABLE `usuario_tiene_perfil`
  ADD CONSTRAINT `usuario_tiene_perfil_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `usuario_tiene_perfil_ibfk_2` FOREIGN KEY (`perfil_id`) REFERENCES `perfil` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
