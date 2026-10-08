The goal is to understand whether the candidate actually has the level of experience we expect from a mid-level developer, particularly with NestJS, Next.js and PostgreSQL.

I’m thinking of giving them a small Project & Task Management System to build.

The application should have user registration and login. A user should be able to create projects and add other registered users as members of those projects. Each project will have multiple tasks and tasks can be assigned to project members.

Each task can have information such as title, description, status, priority, assignee and due date. Task statuses could be something like Todo, In Progress and Done. The task list should also support basic search, filtering, sorting and pagination.

There should be different permissions for the project owner and regular project members. In addition to authentication, I want to see proper authorization and access control. For example, a user should not be able to access another project's data simply by changing an ID in the URL. These kinds of real-world business and security scenarios are important for us to evaluate.

There should also be a basic dashboard showing an overview of projects and tasks, such as total projects, active projects, total tasks, completed tasks, high-priority tasks etc.

Technology Stack
1. Next.js (App Router)
2. NestJS
3. PostgreSQL
4. TypeScript
5. Prisma
6. REST API
7. JWT-based authentication

The UI does not need to be very complex. Our main focus should be on functionality, architecture, and code quality.

From the backend side, I’d particularly like us to evaluate:
A. Proper module/service/controller structure
B. DTOs and validation
C. Authentication and authorization
D. Error handling
E. Clean API design
F. Separation of business logic
G. Proper database relationships and design

For the database, the way they design the relationships between User, Project, Project Member and Task will be important.

For the frontend, we should look at their Next.js structure, API integration, state handling, form validation, loading/error/empty states and overall usability.

We can also require some basic tests and API documentation using Swagger or Postman.

The candidate will have 5 working days to complete the assignment.

The objective is not to see how many features they can build within five days. Rather, we want to understand how they approach a real-world requirement, how they design the solution, what technical decisions they make and whether they can build something clean and maintainable.

It’s okay if they don’t complete every feature within the given time. What they prioritize, what they leave incomplete and the reasoning behind those decisions can also be part of the assessment.

Please prepare the candidate-facing assignment based on this scope. For the submission, we should require the Git repository, README, database migrations/seed data and API documentation.

During the review, I want us to put particular focus on architecture, database design, authorization, code quality and overall problem-solving approach.