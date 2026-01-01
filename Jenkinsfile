pipeline {
    agent any

    triggers {
            pollSCM('H/5 * * * *')
        }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    sh '''
                    docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy image \
                    ecommerce-microservices-api-gateway:latest \
                    > trivy_report.txt
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'trivy_report.txt', fingerprint: true
            sh 'docker system prune -af || true'
        }
    }
}
