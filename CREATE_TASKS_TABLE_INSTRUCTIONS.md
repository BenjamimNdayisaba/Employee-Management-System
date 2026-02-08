# How to Create Tasks Table in Navicat

## Quick Steps

1. **Open Navicat**
   - Connect to your MySQL database
   - Select the `employeems` database

2. **Open Query Window**
   - Click the **"Query"** button (or press `Ctrl+Q`)
   - Click **"New Query"**

3. **Copy and Paste SQL**
   - Open the file: `Server Side/create_tasks_table.sql`
   - Copy all the SQL code
   - Paste it into the query window

4. **Run the Query**
   - Click **"Run"** button (or press `F5`)
   - You should see "Query OK" message

5. **Verify Table Created**
   - Run this query to check:
   ```sql
   SHOW TABLES LIKE 'tasks';
   ```
   - Should show: `tasks`

---

## Alternative: Run Just the Tasks Table SQL

If you prefer, copy and paste this directly into Navicat:

```sql
-- Tasks table
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `assigned_to` INT NOT NULL,
    `assigned_by` INT,
    `due_date` DATETIME,
    `priority` ENUM('low','medium','high') DEFAULT 'medium',
    `status` ENUM('todo','in_progress','done') DEFAULT 'todo',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`assigned_to`) REFERENCES `employee`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`assigned_by`) REFERENCES `admin`(`id`) ON DELETE SET NULL,
    INDEX `idx_task_assigned_to` (`assigned_to`),
    INDEX `idx_task_status` (`status`),
    INDEX `idx_task_due` (`due_date`)
);
```

---

## Troubleshooting

### Error: "Table already exists"
- This is fine! The table already exists, you're good to go ✅

### Error: "Unknown column 'id' in 'employee'"
- Make sure the `employee` table exists first
- Run the employee table creation from `database_setup.sql`

### Error: "Unknown column 'id' in 'admin'"
- Make sure the `admin` table exists first
- Run the admin table creation from `database_setup.sql`

### Error: "Foreign key constraint fails"
- Make sure both `employee` and `admin` tables exist
- Run the full `database_setup.sql` file to create all tables in order

---

## After Creating the Table

1. **Restart your backend server** (if running)
   - Stop it (Ctrl+C)
   - Start again: `npm start` in `Server Side` folder

2. **Test the Tasks feature**
   - Login as admin
   - Go to Tasks page
   - Try creating a task

The table is now ready to store tasks! 🎉

