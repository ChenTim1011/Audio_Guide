## Project Description:  Audio Guide System

The goal of the Audio Guide System is to reduce the cost of tour guide devices by allowing users to listen directly on their phones. It aims to provide real-time, customized tour guide services. Using WebRTC technology, we developed an innovative voice tour guide system optimized for outdoor environments to meet various tour guide needs.

However, practical tests showed that the system performed poorly. Good network conditions were necessary for proper audio reception. Additionally, the sound quality was poor, with noise and intermittent interruptions. Ultimately, we decided to abandon the WebRTC approach. Another team switched to using Bluetooth LE Audio and found that it performed reasonably well.

### Flowchart

![image](https://github.com/ChenTim1011/Audio_Guide/assets/136954078/695ab82d-38ea-4c59-9f47-d91a7bb551ff)


### UML Diagram
![image](https://github.com/ChenTim1011/Audio_Guide/assets/136954078/41175361-cdaa-4078-a661-582b1d8f02d2)

### Sequence diagram
![image](https://github.com/ChenTim1011/Audio_Guide/assets/136954078/0106d702-f8f7-4e75-bc21-ebfa2ae5a7d8)




## Prerequisites
Before you begin, ensure you have met the following requirements:

You have installed Node.js and npm (Node.js package manager). Node.js 20.x or higher is recommended.
You have a basic understanding of terminal or command line commands.
You have Git installed on your machine. If not, follow the instructions on the Git website.

## Installation
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


This command starts the Node.js server. By default, the server will run on your local host.
        You can modify the code in the server.js

If you encounter 'ERR_DLOPEN_FAILED' , you can try the following code

        npm uninstall wrtc
        npm install wrtc

You should now be able to interact with the Audio Guide System from your browser.
