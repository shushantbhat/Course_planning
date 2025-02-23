Lesson Scheduling and Management System
This project is a Lesson Scheduling and Management System designed to help educators and students efficiently plan, organize, and track academic activities. It provides a seamless way to manage semester schedules, teaching days, holidays, and lesson plans, ensuring that all topics are covered within the allocated time frame.

Key Features:
Semester Management:

Define semester start and end dates.

Specify teaching days (e.g., Monday, Tuesday) and holidays.

Save and retrieve semester details for easy access.

Chapter and Topic Management:

Add chapters and subtopics for each subject.

Organize topics in a structured manner for better planning.

Lesson Timetable Generation:

Automatically generate a lesson timetable based on semester details and chapter topics.

Schedule topics on teaching days, skip holidays, and handle non-teaching days.

Reschedule missed topics to the next available teaching day.

User-Friendly Interface:

Intuitive frontend built with React and Vite for a smooth user experience.

Backend powered by Flask for robust data handling and API management.

Data Persistence:

Save semester details, chapter topics, and timetables in JSON files for easy retrieval and updates.

Ensure data consistency and reliability.

User Authentication:

Secure user registration and login system using Flask-SQLAlchemy and Flask-Bcrypt.

Store user credentials securely in a SQLite database.

Error Handling and Debugging:

Comprehensive error handling for both frontend and backend.

Debugging logs to identify and resolve issues quickly.

Technologies Used:
Frontend: React, Vite, Axios

Backend: Flask, Flask-SQLAlchemy, Flask-Bcrypt, Flask-CORS

Database: SQLite (for user authentication)

Data Storage: JSON files (for semester details, chapter topics, and timetables)

How It Works:
Semester Setup:

Educators input semester details, including start and end dates, teaching days, and holidays.

Chapter and Topic Planning:

Educators add chapters and subtopics for each subject.

Timetable Generation:

The system automatically generates a lesson timetable, scheduling topics on teaching days while skipping holidays and non-teaching days.

Daily Progress Tracking:

Educators and students can mark topics as completed or reschedule missed topics to the next available teaching day.

Data Management:

All data is stored in JSON files for easy access and updates.

Benefits:
1)Efficient Planning: Automates the process of creating and managing lesson schedules.
2)Flexibility: Allows rescheduling of missed topics to ensure all material is covered.
3)User-Friendly: Simple and intuitive interface for educators and students.
4)Scalable: Can be extended to support multiple semesters, subjects, and users.

Future Enhancements:
Integration with a calendar application for real-time updates.

Support for multiple users and roles (e.g., admin, teacher, student).

This project is ideal for educational institutions, tutors, and self-learners who want to streamline their lesson planning and ensure efficient time management.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
