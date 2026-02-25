-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `role` ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL,
    `full_name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_login_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patients` (
    `patient_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `date_of_birth` DATE NULL,
    `blood_group` VARCHAR(5) NULL,
    `address` VARCHAR(255) NULL,
    `emergency_contact_name` VARCHAR(120) NULL,
    `emergency_contact_phone` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `patients_user_id_key`(`user_id`),
    PRIMARY KEY (`patient_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctors` (
    `doctor_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `specialization` VARCHAR(120) NOT NULL,
    `license_no` VARCHAR(80) NULL,
    `hospital_name` VARCHAR(160) NULL,
    `experience_years` INTEGER NULL,
    `fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `bio` TEXT NULL,
    `profile_photo_url` VARCHAR(300) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `doctors_user_id_key`(`user_id`),
    UNIQUE INDEX `doctors_license_no_key`(`license_no`),
    PRIMARY KEY (`doctor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_encounters` (
    `encounter_id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT NOT NULL,
    `entered_by_user_id` BIGINT NOT NULL,
    `encounter_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    INDEX `patient_encounters_patient_id_idx`(`patient_id`),
    INDEX `patient_encounters_entered_by_user_id_idx`(`entered_by_user_id`),
    PRIMARY KEY (`encounter_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kidney_lab_results` (
    `lab_id` BIGINT NOT NULL AUTO_INCREMENT,
    `encounter_id` BIGINT NOT NULL,
    `age` INTEGER NULL,
    `blood_pressure` INTEGER NULL,
    `blood_glucose_random` DECIMAL(6, 2) NULL,
    `blood_urea` DECIMAL(6, 2) NULL,
    `serum_creatinine` DECIMAL(6, 2) NULL,
    `sodium` DECIMAL(6, 2) NULL,
    `potassium` DECIMAL(6, 2) NULL,
    `hemoglobin` DECIMAL(6, 2) NULL,
    `packed_cell_volume` DECIMAL(6, 2) NULL,
    `white_blood_cell_count` DECIMAL(10, 2) NULL,
    `red_blood_cell_count` DECIMAL(10, 2) NULL,
    `albumin` ENUM('0', '1', '2', '3', '4', '5') NULL,
    `sugar` ENUM('0', '1', '2', '3', '4', '5') NULL,
    `red_blood_cells` ENUM('normal', 'abnormal') NULL,
    `pus_cell` ENUM('normal', 'abnormal') NULL,
    `bacteria` ENUM('present', 'notpresent') NULL,
    `hypertension` BOOLEAN NULL,
    `diabetes_mellitus` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `kidney_lab_results_encounter_id_key`(`encounter_id`),
    PRIMARY KEY (`lab_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `predictions` (
    `prediction_id` BIGINT NOT NULL AUTO_INCREMENT,
    `encounter_id` BIGINT NOT NULL,
    `model_name` VARCHAR(80) NOT NULL,
    `model_version` VARCHAR(40) NOT NULL,
    `predicted_label` ENUM('CKD', 'NOT_CKD', 'UNKNOWN') NOT NULL,
    `risk_score` DECIMAL(5, 4) NULL,
    `explanation_json` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `predictions_encounter_id_idx`(`encounter_id`),
    PRIMARY KEY (`prediction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `report_id` BIGINT NOT NULL AUTO_INCREMENT,
    `encounter_id` BIGINT NOT NULL,
    `summary` TEXT NOT NULL,
    `recommendations` TEXT NULL,
    `pdf_url` VARCHAR(300) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reports_encounter_id_key`(`encounter_id`),
    PRIMARY KEY (`report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `appointment_id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT NOT NULL,
    `doctor_id` BIGINT NOT NULL,
    `scheduled_start` DATETIME(3) NOT NULL,
    `scheduled_end` DATETIME(3) NULL,
    `status` ENUM('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `reason` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `appointments_doctor_id_scheduled_start_idx`(`doctor_id`, `scheduled_start`),
    INDEX `appointments_patient_id_scheduled_start_idx`(`patient_id`, `scheduled_start`),
    PRIMARY KEY (`appointment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_threads` (
    `thread_id` BIGINT NOT NULL AUTO_INCREMENT,
    `patient_id` BIGINT NOT NULL,
    `doctor_id` BIGINT NULL,
    `thread_type` ENUM('DOCTOR', 'CHATBOT') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_threads_patient_id_idx`(`patient_id`),
    INDEX `chat_threads_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`thread_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `message_id` BIGINT NOT NULL AUTO_INCREMENT,
    `thread_id` BIGINT NOT NULL,
    `sender_user_id` BIGINT NOT NULL,
    `message_text` TEXT NOT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_messages_thread_id_sent_at_idx`(`thread_id`, `sent_at`),
    INDEX `chat_messages_sender_user_id_idx`(`sender_user_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_files` (
    `file_id` BIGINT NOT NULL AUTO_INCREMENT,
    `encounter_id` BIGINT NOT NULL,
    `uploaded_by_user_id` BIGINT NOT NULL,
    `file_type` ENUM('LAB_REPORT', 'SCAN_IMAGE', 'OTHER') NOT NULL,
    `file_url` VARCHAR(400) NOT NULL,
    `original_name` VARCHAR(255) NULL,
    `mime_type` VARCHAR(80) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `medical_files_encounter_id_idx`(`encounter_id`),
    INDEX `medical_files_uploaded_by_user_id_idx`(`uploaded_by_user_id`),
    PRIMARY KEY (`file_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinical_notes` (
    `note_id` BIGINT NOT NULL AUTO_INCREMENT,
    `encounter_id` BIGINT NOT NULL,
    `doctor_id` BIGINT NOT NULL,
    `note_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `clinical_notes_encounter_id_idx`(`encounter_id`),
    INDEX `clinical_notes_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`note_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_reviews` (
    `review_id` BIGINT NOT NULL AUTO_INCREMENT,
    `doctor_id` BIGINT NOT NULL,
    `patient_id` BIGINT NOT NULL,
    `rating` INTEGER NOT NULL,
    `review_text` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `doctor_reviews_doctor_id_idx`(`doctor_id`),
    INDEX `doctor_reviews_patient_id_idx`(`patient_id`),
    UNIQUE INDEX `uniq_review`(`doctor_id`, `patient_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitor_logs` (
    `visitor_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `page` VARCHAR(200) NULL,
    `visited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `visitor_logs_user_id_idx`(`user_id`),
    PRIMARY KEY (`visitor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_encounters` ADD CONSTRAINT `patient_encounters_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_encounters` ADD CONSTRAINT `patient_encounters_entered_by_user_id_fkey` FOREIGN KEY (`entered_by_user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kidney_lab_results` ADD CONSTRAINT `kidney_lab_results_encounter_id_fkey` FOREIGN KEY (`encounter_id`) REFERENCES `patient_encounters`(`encounter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `predictions` ADD CONSTRAINT `predictions_encounter_id_fkey` FOREIGN KEY (`encounter_id`) REFERENCES `patient_encounters`(`encounter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_encounter_id_fkey` FOREIGN KEY (`encounter_id`) REFERENCES `patient_encounters`(`encounter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `chat_threads`(`thread_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_user_id_fkey` FOREIGN KEY (`sender_user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_files` ADD CONSTRAINT `medical_files_encounter_id_fkey` FOREIGN KEY (`encounter_id`) REFERENCES `patient_encounters`(`encounter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_files` ADD CONSTRAINT `medical_files_uploaded_by_user_id_fkey` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_notes` ADD CONSTRAINT `clinical_notes_encounter_id_fkey` FOREIGN KEY (`encounter_id`) REFERENCES `patient_encounters`(`encounter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_notes` ADD CONSTRAINT `clinical_notes_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_reviews` ADD CONSTRAINT `doctor_reviews_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_reviews` ADD CONSTRAINT `doctor_reviews_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visitor_logs` ADD CONSTRAINT `visitor_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
