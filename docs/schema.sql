-- =====================================================================
-- LUDEBRA LABS — Esquema de base de datos de prueba
-- Base de datos: MySQL
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Roles (
    Id      VARCHAR(10) NOT NULL,
    Name    VARCHAR(30) NOT NULL,
    PRIMARY KEY (Id),
    UNIQUE KEY uk_roles_name (Name)
);

-- ---------------------------------------------------------------------
-- States (estados genéricos para cursos, tareas, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS states (
    Id_state    INT AUTO_INCREMENT,
    Name        VARCHAR(30) NOT NULL,
    Entity      VARCHAR(30) NOT NULL,
    Code        VARCHAR(10),
    PRIMARY KEY (Id_state)
);

-- ---------------------------------------------------------------------
-- Simuladores
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulator (
    Id_simulador    INT AUTO_INCREMENT,
    Name            VARCHAR(100) NOT NULL,
    Url             VARCHAR(255),
    Description     VARCHAR(500),
    Status          TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (Id_simulador)
);

-- ---------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
    Email               VARCHAR(100) NOT NULL,
    First_Name          VARCHAR(50)  NOT NULL,
    Second_Name         VARCHAR(50),
    Profile_Picture     VARCHAR(255),
    Id_Profile          VARCHAR(100),
    id_role             VARCHAR(10)  NOT NULL,
    Status              TINYINT(1)   NOT NULL DEFAULT 1,
    Created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Email),
    CONSTRAINT Users_Roles_id_fk
        FOREIGN KEY (id_role) REFERENCES Roles (Id)
);

-- ---------------------------------------------------------------------
-- Cursos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    Id_course       VARCHAR(8)   NOT NULL,
    Name            VARCHAR(100) NOT NULL,
    Code            VARCHAR(13),
    Id_state        INT          NOT NULL,
    Description     VARCHAR(500),
    PRIMARY KEY (Id_course),
    UNIQUE KEY uk_courses_code (Code),
    CONSTRAINT fk_courses_state
        FOREIGN KEY (Id_state) REFERENCES states (Id_state)
);

-- ---------------------------------------------------------------------
-- Periodos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS periods (
    Id_period   INT AUTO_INCREMENT,
    Id_course   VARCHAR(8)  NOT NULL,
    Name        VARCHAR(30) NOT NULL,
    Start_date  DATE,
    End_date    DATE,
    PRIMARY KEY (Id_period),
    CONSTRAINT fk_periods_course
        FOREIGN KEY (Id_course) REFERENCES courses (Id_course)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Inscripciones (usuarios ↔ cursos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users_courses (
    Email_User      VARCHAR(100) NOT NULL,
    Id_course       VARCHAR(8)   NOT NULL,
    Enrollment_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Email_User, Id_course),
    CONSTRAINT Users_courses_Users_fk
        FOREIGN KEY (Email_User) REFERENCES Users (Email)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT Users_courses_courses_fk
        FOREIGN KEY (Id_course) REFERENCES courses (Id_course)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    Id_task         INT AUTO_INCREMENT,
    Name            VARCHAR(100) NOT NULL,
    Descriptions    VARCHAR(500),
    Creation_date   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Expiration_date DATETIME,
    Id_state        INT          NOT NULL,
    created_by      VARCHAR(100) NOT NULL,
    Max_score       DECIMAL(4,2) NOT NULL DEFAULT 5.00,
    Id_period       INT          NOT NULL,
    PRIMARY KEY (Id_task),
    CONSTRAINT fk_tasks_state
        FOREIGN KEY (Id_state) REFERENCES states (Id_state),
    CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by) REFERENCES Users (Email)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_tasks_period
        FOREIGN KEY (Id_period) REFERENCES periods (Id_period)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Relación tareas ↔ simuladores (N:N)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_simulators (
    Id_task         INT NOT NULL,
    Id_simulador    INT NOT NULL,
    PRIMARY KEY (Id_task, Id_simulador),
    CONSTRAINT fk_task_simulators_task
        FOREIGN KEY (Id_task) REFERENCES tasks (Id_task)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_task_simulators_simulador
        FOREIGN KEY (Id_simulador) REFERENCES simulator (Id_simulador)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Entregas de usuarios (User_tasks)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS User_tasks (
    email_User          VARCHAR(100) NOT NULL,
    Id_task             INT          NOT NULL,
    Qualification       DECIMAL(4,2),
    Delivery_date       DATETIME,
    Qualification_date  DATETIME,
    Feedback_comments   VARCHAR(500),
    Comment             VARCHAR(500),
    PRIMARY KEY (email_User, Id_task),
    CONSTRAINT User_tasks_Users_fk
        FOREIGN KEY (email_User) REFERENCES Users (Email)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT User_tasks_tasks_fk
        FOREIGN KEY (Id_task) REFERENCES tasks (Id_task)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Configuración de evaluación por actividad (Módulo 4)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Task_evaluation_config (
    Id_task          INT         NOT NULL,
    Activity_code    VARCHAR(30) NOT NULL,
    Rubric_criteria  JSON        NOT NULL,
    PRIMARY KEY (Id_task),
    UNIQUE KEY uk_task_evaluation_activity_code (Activity_code),
    CONSTRAINT fk_task_evaluation_config_task
        FOREIGN KEY (Id_task) REFERENCES tasks (Id_task)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Borradores y metadatos de calificación (Módulo 4)
-- La nota publicada continúa almacenada en User_tasks.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS User_task_evaluations (
    email_User          VARCHAR(100) NOT NULL,
    Id_task             INT          NOT NULL,
    Draft_qualification DECIMAL(4,2),
    Draft_feedback      VARCHAR(500),
    Selected_criteria   JSON,
    Status              VARCHAR(10)  NOT NULL,
    Teacher_email       VARCHAR(100) NOT NULL,
    Updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (email_User, Id_task),
    CONSTRAINT fk_user_task_evaluation_delivery
        FOREIGN KEY (email_User, Id_task)
        REFERENCES User_tasks (email_User, Id_task)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_user_task_evaluation_teacher
        FOREIGN KEY (Teacher_email) REFERENCES Users (Email)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Archivos de tareas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_files (
    Id_task_file    INT AUTO_INCREMENT,
    Id_task         INT          NOT NULL,
    Url_file        VARCHAR(500) NOT NULL,
    File_name       VARCHAR(255) NOT NULL,
    File_type       VARCHAR(20),
    Upload_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Id_task_file),
    CONSTRAINT fk_task_files_task
        FOREIGN KEY (Id_task) REFERENCES tasks (Id_task)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Archivos de entregas (legacy — ver task_files para archivos de tareas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS files (
    Id_file         VARCHAR(100) NOT NULL,
    Url_file        VARCHAR(500) NOT NULL,
    email_User      VARCHAR(100) NOT NULL,
    Id_task         INT          NOT NULL,
    File_name       VARCHAR(255) NOT NULL,
    File_type       VARCHAR(20),
    Upload_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Id_file),
    CONSTRAINT files_User_tasks_fk
        FOREIGN KEY (email_User, Id_task) REFERENCES User_tasks (email_User, Id_task)
        ON UPDATE CASCADE ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- DATOS DE PRUEBA
-- =====================================================================

-- Roles
INSERT INTO Roles (Id, Name) VALUES
    ('admin', 'Administrador'),
    ('teacher', 'Docente'),
    ('student', 'Estudiante');

-- States (cursos)
INSERT INTO states (Name, Entity, Code) VALUES
    ('Activo',   'course', 'ACT'),
    ('Inactivo', 'course', 'INA'),
    ('Borrador', 'course', 'BOR');

-- States (tareas)
INSERT INTO states (Name, Entity, Code) VALUES
    ('Publicada',  'task', 'PUB'),
    ('Oculta',     'task', 'OCU'),
    ('Vencida',    'task', 'VNC');

-- Simuladores
INSERT INTO simulator (Name, Url, Description, Status) VALUES
    ('Circuito RC',        'https://sim.ludebra.edu.co/rc',  'Simulador de circuitos RC serie',        1),
    ('Ondas Estacionarias', 'https://sim.ludebra.edu.co/ondas', 'Simulador de ondas estacionarias',     1),
    ('Campo Eléctrico',    'https://sim.ludebra.edu.co/ce',   'Simulación de campo eléctrico puntual', 1);

-- Usuarios (Firebase UIDs ficticios — reemplazar con valores reales al crear en Firebase)
INSERT INTO Users (Email, First_Name, Second_Name, id_role, Status) VALUES
    ('admin@unicesar.edu.co',    'Carlos',  'Mendoza',  'admin',   1),
    ('docente@unicesar.edu.co',  'María',   'López',    'teacher', 1),
    ('estudiante@unicesar.edu.co', 'Andrés', 'Ramírez', 'student', 1);

-- Cursos
INSERT INTO courses (Id_course, Name, Code, Id_state, Description) VALUES
    ('FIS101',  'Electromagnetismo I',  'FIS-101',  1, 'Electricidad, magnetismo y ondas electromagnéticas'),
    ('FIS102',  'Óptica Geométrica',    'FIS-102',  1, 'Reflexión, refracción y sistemas de lentes'),
    ('MAT201',  'Ecuaciones Diferenciales', 'MAT-201', 1, 'EDO de primer y segundo orden');

-- Periodos
INSERT INTO periods (Id_course, Name, Start_date, End_date) VALUES
    ('FIS101', 'Periodo 1', '2026-01-15', '2026-05-30'),
    ('FIS101', 'Periodo 2', '2026-08-01', '2026-12-15'),
    ('FIS102', 'Periodo 1', '2026-01-15', '2026-05-30'),
    ('MAT201', 'Periodo 1', '2026-01-15', '2026-05-30');

-- Inscripciones
INSERT INTO Users_courses (Email_User, Id_course) VALUES
    ('docente@unicesar.edu.co',    'FIS101'),
    ('docente@unicesar.edu.co',    'FIS102'),
    ('estudiante@unicesar.edu.co', 'FIS101'),
    ('estudiante@unicesar.edu.co', 'MAT201');

-- Tareas
INSERT INTO tasks (Name, Descriptions, Id_state, created_by, Max_score, Id_period, Expiration_date) VALUES
    ('Práctica 1: Ley de Coulomb',    'Medición de fuerza entre cargas puntuales',     4, 'docente@unicesar.edu.co', 5.00, 1, '2026-03-15 23:59:00'),
    ('Práctica 2: Campo Eléctrico',    'Mapa de líneas de campo para distribuciones',   4, 'docente@unicesar.edu.co', 5.00, 1, '2026-04-10 23:59:00'),
    ('Práctica 3: Circuitos RC',       'Análisis de carga y descarga de un capacitor',  4, 'docente@unicesar.edu.co', 5.00, 2, '2026-09-30 23:59:00'),
    ('Tarea Theory: Ondas',            'Resolución de problemas teóricos sobre ondas',  4, 'docente@unicesar.edu.co', 3.00, 2, NULL);

-- Simuladores ↔ Tareas
INSERT INTO task_simulators (Id_task, Id_simulador) VALUES
    (1, 3),
    (2, 3),
    (3, 1),
    (4, 2);

-- Entregas de usuarios
INSERT INTO User_tasks (email_User, Id_task, Delivery_date, Qualification, Qualification_date, Feedback_comments, Comment) VALUES
    ('estudiante@unicesar.edu.co', 1, '2026-03-10 14:23:00', 4.50, '2026-03-12 09:00:00', 'Buen manejo del instrumento. Revisar unidades.', 'Entrega práctica Coulomb'),
    ('estudiante@unicesar.edu.co', 2, '2026-04-08 18:45:00', NULL,  NULL, NULL,                  'Mapa de campo completado');

-- Configuración de evaluación: código visible y rúbrica del docente
INSERT INTO Task_evaluation_config (Id_task, Activity_code, Rubric_criteria) VALUES
    (1, 'LAB-FIS-001', JSON_ARRAY(
        JSON_OBJECT('id', 'theoretical-calculations', 'label', 'Precisión en cálculos teóricos'),
        JSON_OBJECT('id', 'si-units', 'label', 'Correcto uso de unidades SI'),
        JSON_OBJECT('id', 'charts-and-tables', 'label', 'Calidad de gráficas y tablas')
    )),
    (2, 'LAB-FIS-002', JSON_ARRAY(
        JSON_OBJECT('id', 'theoretical-calculations', 'label', 'Precisión en cálculos teóricos'),
        JSON_OBJECT('id', 'si-units', 'label', 'Correcto uso de unidades SI'),
        JSON_OBJECT('id', 'charts-and-tables', 'label', 'Calidad de gráficas y tablas')
    )),
    (3, 'LAB-FIS-003', JSON_ARRAY(
        JSON_OBJECT('id', 'theoretical-calculations', 'label', 'Precisión en cálculos teóricos'),
        JSON_OBJECT('id', 'si-units', 'label', 'Correcto uso de unidades SI'),
        JSON_OBJECT('id', 'charts-and-tables', 'label', 'Calidad de gráficas y tablas')
    )),
    (4, 'LAB-FIS-004', JSON_ARRAY(
        JSON_OBJECT('id', 'theoretical-calculations', 'label', 'Precisión en cálculos teóricos'),
        JSON_OBJECT('id', 'si-units', 'label', 'Correcto uso de unidades SI'),
        JSON_OBJECT('id', 'charts-and-tables', 'label', 'Calidad de gráficas y tablas')
    ));

INSERT INTO User_task_evaluations (
    email_User,
    Id_task,
    Draft_qualification,
    Draft_feedback,
    Selected_criteria,
    Status,
    Teacher_email
) VALUES (
    'estudiante@unicesar.edu.co',
    1,
    4.50,
    'Buen manejo del instrumento. Revisar unidades.',
    JSON_ARRAY('theoretical-calculations', 'charts-and-tables'),
    'published',
    'docente@unicesar.edu.co'
);

-- Archivos de tareas
INSERT INTO task_files (Id_task, Url_file, File_name, File_type) VALUES
    (1, '/uploads/tasks/guia_coulomb.pdf',  'Guía_práctica_1.pdf',  'pdf'),
    (3, '/uploads/tasks/manual_rc.pdf',     'Manual_circuitos.pdf',  'pdf');
