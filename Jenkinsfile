pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/MohamedHabibFrigui/ecommerce-microservices.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker compose build'
                }
            }
        }

        stage('Run Application') {
            steps {
                script {
                    sh 'docker compose up -d'
                }
            }
        }
    }
}
