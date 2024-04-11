Audio Guide System

Welcome to the Audio Guide System repository. This guide will help you get the system up and running on your local machine for development and testing purposes.

Prerequisites
Before you begin, ensure you have met the following requirements:

You have installed Node.js and npm (Node.js package manager). Node.js 20.x or higher is recommended.
You have a basic understanding of terminal or command line commands.
You have Git installed on your machine. If not, follow the instructions on the Git website.

Installation
Follow these steps to install the Audio Guide System:


1. Clone the Repository
First, clone the repository to your local machine. Open your terminal or command prompt, navigate to the directory where you want to clone the repository, and run the following command:


        git clone https://github.com/ChenTim1011/Audio_Guide.git


This command downloads the Audio Guide project and its files to your machine.

2. Install Dependencies
Navigate into the project directory:


        cd Audio_Guide


Then, install the project dependencies. You can use either npm or yarn for this purpose. If you're using npm, run:


        npm install


This command installs all the dependencies listed in package.json including Express, which is a fast, unopinionated, minimalist web framework for Node.js.

For an explicit install of Express (though it should already be listed in your package.json dependencies), you can run:


        npm install express


3. Start the Server
Once the dependencies are installed, you can start the server with the following command:


        node server.js


This command starts the Node.js server. By default, the server will run on https://chentim1011.github.io/Audio_Guide/, you can change to your website by github page service.


If you encounter 'ERR_DLOPEN_FAILED' , you can try the following code
        npm uninstall wrtc
        npm install wrtc

Usage
After starting the server, you can access the Audio Guide System by opening a web browser and navigating to:


        https://chentim1011.github.io/Audio_Guide/


You should now be able to interact with the Audio Guide System from your browser.
