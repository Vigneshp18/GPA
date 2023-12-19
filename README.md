
# Graphical Password Authentication

## Overview

This project implements a graphical password authentication system using Node.js, Express, EJS (as the template engine), and Mongoose for MongoDB. Users select a specific area or sequence of areas within an image to authenticate themselves.

## Features

- **Image-based Authentication**: Users choose a personal image and specify a unique sequence of areas within that image to create their graphical password.

- **Security**: Graphical passwords can offer increased security by adding an extra layer of complexity compared to traditional text-based passwords.

- **User-friendly Interface**: The system provides an intuitive and user-friendly interface for setting up and using graphical passwords.

- **Database Storage**: User data, including graphical passwords, is stored in MongoDB using Mongoose.

## Prerequisites

- Node.js
- MongoDB
- npm

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Vigneshp18/GPA.git
    ```

2. Install the Dependencies
    ```bash
    cd GPA
    npm install
    ```

3. Setup MongoDB Dependencies
- Make sure you have install mongoDB on local computer.
- Else, Connect with Cloud MongoDB.

4. Create an Environment file.
- Create `.env` file to set the MongoDB Connection URL.
- Inside set the environment variables mentioned below
    ```bash 
    MONGODB_URL = your_connection_string
    EMAIL = your_email
    PASS = your_email_password
    FROM = your_email
    PORT = 3000 (default)
    ```

5. Run the application.
    ```bash
    node index.js
    ```
## Usage
- Open the application in your web browser.
- Register an account and set up your graphical password.
- Log in using your graphical password.
## Project Structure

- **index.js**: Express application setup.
- **routes/**: Contains route handlers.
- **views/**: EJS templates.
- **public/**: Static files (images, stylesheets).
- **models/**: Mongoose models for MongoDB.
## Contribution

Thanks for your Contribution to this project by following students.

- Vignesh P
- Govindha Shuvilesh B
## License

None

