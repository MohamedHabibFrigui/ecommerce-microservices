pipeline {
    agent any

    triggers {
            pollSCM('H/5 * * * *')
    }

    environment {
        COMPOSE_PROJECT_NAME = "ecommerce"
        DOCKERHUB_REPO = "mohamedhabibfrigui/ecommerce"
        IMAGE_TAG = "${BUILD_NUMBER}"
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
                sh '''
                for img in ecommerce-api-gateway ecommerce-product-service ecommerce-user-service ecommerce-order-service; do
                docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy image $img:latest >> trivy_report.txt
                done
                '''
            }
        }


        stage('Docker Hub Login & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                    echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin

                    docker tag ecommerce-api-gateway:latest \
                        $DOCKERHUB_REPO:api-gateway-$IMAGE_TAG
                    docker push $DOCKERHUB_REPO:api-gateway-$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                docker compose down || true
                docker compose up -d
                '''
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
