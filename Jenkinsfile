pipeline {
    agent {
        kubernetes {
            retries 2
            yaml '''
apiVersion: v1
kind: Pod
spec:
  automountServiceAccountToken: false
  securityContext:
    fsGroup: 1000
  containers:
    - name: backend-test
      image: eclipse-temurin:21-jdk-alpine
      command: ["cat"]
      tty: true
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
      resources:
        requests:
          cpu: "250m"
          memory: "512Mi"
        limits:
          cpu: "2"
          memory: "2Gi"
    - name: frontend-deps
      image: oven/bun:1.3.14-alpine
      command: ["cat"]
      tty: true
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
      resources:
        requests:
          cpu: "250m"
          memory: "512Mi"
        limits:
          cpu: "2"
          memory: "2Gi"
    - name: frontend-test
      image: node:24-alpine
      command: ["cat"]
      tty: true
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
      resources:
        requests:
          cpu: "250m"
          memory: "512Mi"
        limits:
          cpu: "2"
          memory: "2Gi"
    - name: helm
      image: alpine/helm:3.17.3
      command: ["cat"]
      tty: true
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
    - name: buildkit
      image: moby/buildkit:v0.33.0-rootless
      args: ["--oci-worker-no-process-sandbox"]
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
        seccompProfile:
          type: Unconfined
        appArmorProfile:
          type: Unconfined
      readinessProbe:
        exec:
          command: ["buildctl", "--addr", "tcp://127.0.0.1:1234", "debug", "workers"]
        initialDelaySeconds: 5
        periodSeconds: 5
        failureThreshold: 30
      resources:
        requests:
          cpu: "500m"
          memory: "512Mi"
          ephemeral-storage: "2Gi"
        limits:
          cpu: "4"
          memory: "8Gi"
          ephemeral-storage: "20Gi"
      volumeMounts:
        - name: buildkit-storage
          mountPath: /home/user/.local/share/buildkit
    - name: yq
      image: mikefarah/yq:4.45.1
      command: ["cat"]
      tty: true
      securityContext:
        runAsUser: 1000
        runAsGroup: 1000
  volumes:
    - name: buildkit-storage
      emptyDir:
        sizeLimit: 20Gi
'''
        }
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(false)
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        string(name: 'REGISTRY', defaultValue: 'docker.io', description: 'OCI registry hostname')
        string(name: 'IMAGE_NAMESPACE', defaultValue: 'roa15', description: 'Registry organization or namespace')
        string(name: 'FRONTEND_PUBLIC_API_URL', defaultValue: '/backend-api', description: 'Browser path handled by the frontend server-side proxy')
        string(name: 'GITOPS_REPO_URL', defaultValue: 'git@github.com:itme-roa15/game-shop-cicd.git', description: 'GitOps repository SSH URL')
        string(name: 'GITOPS_BRANCH', defaultValue: 'main', description: 'GitOps branch to update')
    }

    environment {
        REGISTRY_CREDENTIALS = 'dockerhub-cred'
        GITOPS_SSH_CREDENTIALS = 'gitops-repo-ssh-key'
    }

    stages {
        stage('Prepare build metadata') {
            steps {
                script {
                    env.APP_COMMIT = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.APP_COMMIT}"
                }
            }
        }

        stage('Test backend') {
            steps {
                container('backend-test') {
                    sh '''
                        sed -i 's/services.gradle.org/downloads.gradle.org/' backend/gradle/wrapper/gradle-wrapper.properties
                        if grep -q '^networkTimeout=' backend/gradle/wrapper/gradle-wrapper.properties; then
                          sed -i 's/^networkTimeout=.*/networkTimeout=300000/' backend/gradle/wrapper/gradle-wrapper.properties
                        else
                          echo 'networkTimeout=300000' >> backend/gradle/wrapper/gradle-wrapper.properties
                        fi

                        cd backend
                        ./gradlew test --no-daemon
                    '''
                }
            }
        }

        stage('Test frontend') {
            steps {
                container('frontend-deps') {
                    sh '''
                        cd frontend/game-shop
                        bun install --frozen-lockfile
                    '''
                }
                container('frontend-test') {
                    sh '''
                        cd frontend/game-shop
                        node node_modules/eslint/bin/eslint.js .
                        NEXT_PUBLIC_API_URL="$FRONTEND_PUBLIC_API_URL" \
                          node node_modules/next/dist/bin/next build --webpack
                    '''
                }
            }
        }

        stage('Checkout GitOps repository') {
            when {
                branch 'main'
            }
            steps {
                dir('gitops') {
                    deleteDir()
                    checkout([$class: 'GitSCM',
                            branches: [[name: "*/${params.GITOPS_BRANCH}"]],
                            userRemoteConfigs: [[
                                url: params.GITOPS_REPO_URL,
                                credentialsId: env.GITOPS_SSH_CREDENTIALS
                            ]]
                        ])
                }
            }
        }

        stage('Validate Helm charts') {
            when {
                branch 'main'
            }
            steps {
                container('helm') {
                    sh '''
                        helm lint gitops/charts/game-shop-backend \
                          --values gitops/charts/game-shop-backend/values-production.yaml

                        helm lint gitops/charts/game-shop-frontend \
                          --values gitops/charts/game-shop-frontend/values-production.yaml
                    '''
                }
            }
        }

        stage('Build and publish images') {
            when {
                branch 'main'
            }
            steps {
                container('buildkit') {
                    withCredentials([usernamePassword(
                                credentialsId: env.REGISTRY_CREDENTIALS,
                                usernameVariable: 'REGISTRY_USER',
                                passwordVariable: 'REGISTRY_PASSWORD'
                            )]) {
                        sh '''
                            export BUILDKIT_HOST="tcp://127.0.0.1:1234"
                            export DOCKER_CONFIG="/tmp/buildkit-docker-config"
                            mkdir -p "$DOCKER_CONFIG"
                            trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                            for attempt in $(seq 1 30); do
                              buildctl debug workers >/dev/null 2>&1 && break
                              sleep 2
                            done
                            buildctl debug workers >/dev/null

                            REGISTRY_AUTH_HOST="$REGISTRY"
                            if [ "$REGISTRY" = "docker.io" ]; then
                              REGISTRY_AUTH_HOST="https://index.docker.io/v1/"
                            fi
                            REGISTRY_AUTH=$(printf '%s:%s' "$REGISTRY_USER" "$REGISTRY_PASSWORD" | base64 | tr -d '\\n')
                            printf '{"auths":{"%s":{"auth":"%s"}}}\n' \
                              "$REGISTRY_AUTH_HOST" "$REGISTRY_AUTH" >"$DOCKER_CONFIG/config.json"
                            chmod 600 "$DOCKER_CONFIG/config.json"

                            BACKEND_IMAGE="$REGISTRY/$IMAGE_NAMESPACE/game-shop-backend:$IMAGE_TAG"
                            buildctl build \
                              --frontend dockerfile.v0 \
                              --local context="$WORKSPACE/backend" \
                              --local dockerfile="$WORKSPACE/backend" \
                              --output "type=image,name=$BACKEND_IMAGE,push=true"

                            FRONTEND_IMAGE="$REGISTRY/$IMAGE_NAMESPACE/game-shop-frontend:$IMAGE_TAG"
                            buildctl build \
                              --frontend dockerfile.v0 \
                              --local context="$WORKSPACE/frontend/game-shop" \
                              --local dockerfile="$WORKSPACE/frontend/game-shop" \
                              --opt "build-arg:NEXT_PUBLIC_API_URL=$FRONTEND_PUBLIC_API_URL" \
                              --output "type=image,name=$FRONTEND_IMAGE,push=true"
                        '''
                    }
                }
            }
        }

        stage('Update GitOps values') {
            when {
                branch 'main'
            }
            steps {
                dir('gitops') {
                    container('yq') {
                        sh '''
                            export BACKEND_IMAGE="$REGISTRY/$IMAGE_NAMESPACE/game-shop-backend"
                            export FRONTEND_IMAGE="$REGISTRY/$IMAGE_NAMESPACE/game-shop-frontend"

                            yq -i '.image.repository = strenv(BACKEND_IMAGE) |
                                   .image.tag = strenv(IMAGE_TAG)' \
                              charts/game-shop-backend/values-production.yaml

                            yq -i '.image.repository = strenv(FRONTEND_IMAGE) |
                                   .image.tag = strenv(IMAGE_TAG)' \
                              charts/game-shop-frontend/values-production.yaml
                        '''
                    }
                    container('helm') {
                        sh '''
                            helm template game-shop-backend charts/game-shop-backend \
                              --namespace game-shop \
                              --values charts/game-shop-backend/values-production.yaml >/dev/null

                            helm template game-shop-frontend charts/game-shop-frontend \
                              --namespace game-shop \
                              --values charts/game-shop-frontend/values-production.yaml >/dev/null
                        '''
                    }
                    sshagent(credentials: [env.GITOPS_SSH_CREDENTIALS]) {
                        sh '''
                            git config user.name "Jenkins CI"
                            git config user.email "jenkins@gameshop.local"
                            git add charts/game-shop-backend/values-production.yaml \
                              charts/game-shop-frontend/values-production.yaml
                            git diff --cached --quiet && exit 0
                            git commit -m "deploy: game-shop $IMAGE_TAG [skip ci]"
                            export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=$WORKSPACE/.gitops-known-hosts"
                            git push origin "HEAD:$GITOPS_BRANCH"
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}
