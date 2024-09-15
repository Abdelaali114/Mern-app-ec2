pipeline {
    agent any

    environment {
        DOCKER_USERNAME = credentials('docker-username')  // Jenkins credentials for Docker Hub username
        DOCKER_PASSWORD = credentials('docker-password')  // Jenkins credentials for Docker Hub password
        MONGO_PASSWORD = credentials('mongo-password')    // MongoDB password for deployment
        NODE_VERSION = '18.x'                            // Node.js version to use
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout repository code
                checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/Abdelaali114/Mern-app-ec2.git']])
            }
        }

        // 1. Test both server and client
        stage('Test Backend and Frontend') {
            matrix {
                axes {
                    axis {
                        name 'NODE_VERSION'
                        values '18.x'
                    }
                }
                stages {
                    stage('Install Backend Dependencies') {
                        steps {
                            script {
                                // Set up Node.js and install backend dependencies
                                sh '''
                                   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                                   sudo apt-get install -y nodejs
                                   cd server
                                   npm install
                                '''
                            }
                        }
                    }

                   stage('Install Frontend Dependencies') {
                        steps {
                            script {
                                // Set up Node.js and install frontend dependencies
                                sh '''
                                    curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo bash -
                                    sudo apt-get install -y nodejs
                                    cd client
                                    npm install
                                '''
                            }
                        }
                    }
                }
            }
        }

        // 2. Build and push Docker images for both backend and frontend
        stage('Build and Push Docker Images') {
            steps {
                script {
                    // Log in to Docker Hub
                    sh 'echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin'

                    // Build and push backend Docker image
                    sh '''
                        docker build -t abdelaali2550/alumni-backend-test:latest ./server
                        docker push abdelaali2550/alumni-backend-test:latest
                    '''

                    // Build and push frontend Docker image
                    sh '''
                        docker build -t abdelaali2550/alumni-frontend-test:latest ./client
                        docker push abdelaali2550/alumni-frontend-test:latest
                    '''
                }
            }
        }

        // 3. Deploy both backend and frontend
        stage('Deploy') {
            agent {
                label 'self-hosted'  // Use a self-hosted agent
            }

            steps {
                script {
                    // Deploy backend
                    sh '''
                         docker pull abdelaali2550/alumni-backend-test:latest
                         docker stop alumni-backend-test-container || true
                         docker rm alumni-backend-test-container || true
                         docker run -d -p 3001:3001 --name alumni-backend-test-container \
                        -e MONGO_PASSWORD='${MONGO_PASSWORD}' \
                        abdelaali2550/alumni-backend-test:latest
                    '''

                    // Deploy frontend
                    sh '''
                         docker pull abdelaali2550/alumni-frontend-test:latest
                         docker stop alumni-frontend-test-container || true
                         docker rm alumni-frontend-test-container || true
                         docker run -d -p 5173:80 --name alumni-frontend-test-container \
                        abdelaali2550/alumni-frontend-test:latest
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Build, test, and deployment successful!'
        }
        failure {
            echo 'Build, test, or deployment failed!'
        }
    }
}
