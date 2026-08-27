-- LUDEBRA LABS — ampliación no destructiva del Módulo 4
-- Ejecutar una sola vez sobre una base creada con una versión anterior de
-- docs/schema.sql. Todas las tablas pertenecen al módulo de evaluación.

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

INSERT IGNORE INTO Task_evaluation_config (
    Id_task,
    Activity_code,
    Rubric_criteria
)
SELECT
    task.Id_task,
    CONCAT(
        'LAB-',
        COALESCE(NULLIF(SUBSTRING_INDEX(UPPER(course.Code), '-', 1), ''), 'ACT'),
        '-',
        LPAD(task.Id_task, 3, '0')
    ),
    JSON_ARRAY(
        JSON_OBJECT('id', 'theoretical-calculations', 'label', 'Precisión en cálculos teóricos'),
        JSON_OBJECT('id', 'si-units', 'label', 'Correcto uso de unidades SI'),
        JSON_OBJECT('id', 'charts-and-tables', 'label', 'Calidad de gráficas y tablas')
    )
FROM tasks AS task
INNER JOIN periods AS period ON period.Id_period = task.Id_period
INNER JOIN courses AS course ON course.Id_course = period.Id_course;

INSERT IGNORE INTO User_task_evaluations (
    email_User,
    Id_task,
    Draft_qualification,
    Draft_feedback,
    Selected_criteria,
    Status,
    Teacher_email
)
SELECT
    delivery.email_User,
    delivery.Id_task,
    delivery.Qualification,
    delivery.Feedback_comments,
    JSON_ARRAY(),
    'published',
    task.created_by
FROM User_tasks AS delivery
INNER JOIN tasks AS task ON task.Id_task = delivery.Id_task
WHERE delivery.Qualification IS NOT NULL;
