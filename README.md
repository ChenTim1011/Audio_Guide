## Audio Guide System
專題說明:語音導覽系統希望可以降低導覽用子機的成本，直接利用手機收聽，而且可以提供即時、客製化的導覽服務，利用WebRTC技術，開發一套創新的語音導覽系統，針對戶外環境進行優化，滿足不同導覽需求。<br>
=> 但實測發現效果不好，要在網路環境較佳環境，才能收聽到，而且收音品質不佳，會有雜音和斷斷續續，最後宣告放棄使用WebRTC的方法，另外一組改用藍牙LEaudio發現效果還可以。
### 流程圖
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
