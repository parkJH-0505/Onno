# Onno - 인프라 아키텍처 (Infrastructure Architecture)

**작성일**: 2025-12-02
**버전**: 1.0
**목적**: AWS 기반 프로덕션 인프라 설계 및 배포 전략

**연결 문서**:
- [시스템 아키텍처 설계서](./Onno%20-%20시스템%20아키텍처%20설계서%20(System%20Architecture%20Design).md)
- [API 명세서](./Onno%20-%20API%20명세서.md)

---

## 목차

1. [인프라 개요](#1-인프라-개요)
2. [AWS 서비스 구성](#2-aws-서비스-구성)
3. [네트워크 아키텍처](#3-네트워크-아키텍처)
4. [컴퓨팅 인프라](#4-컴퓨팅-인프라)
5. [데이터 인프라](#5-데이터-인프라)
6. [CI/CD 파이프라인](#6-cicd-파이프라인)
7. [모니터링 & 로깅](#7-모니터링--로깅)
8. [비용 최적화](#8-비용-최적화)
9. [Disaster Recovery](#9-disaster-recovery)
10. [확장 계획](#10-확장-계획)

---

## 1. 인프라 개요

### 1-1. 인프라 설계 원칙

```
1. Cloud-Native
   - AWS 관리형 서비스 우선 사용
   - 서버리스 활용 (Lambda, Fargate)
   - Auto-scaling

2. High Availability
   - Multi-AZ 배포
   - 자동 failover
   - 99.5% uptime 목표

3. Security First
   - VPC 격리
   - IAM 최소 권한 원칙
   - 모든 데이터 암호화

4. Cost-Effective
   - 개발/스테이징/프로덕션 환경 분리
   - Reserved Instances (장기)
   - Spot Instances (가능한 곳)

5. Observability
   - 모든 레이어 로깅
   - 실시간 메트릭
   - 분산 추적 (Tracing)
```

---

### 1-2. 환경별 인프라

```
┌─────────────────────────────────────────────────┐
│  Development (개발)                              │
├─────────────────────────────────────────────────┤
│  - 로컬 환경 + Docker Compose                    │
│  - 개발자 개인 AWS 계정 (선택)                    │
│  - 비용: ~$0 (로컬) ~ $50/month (클라우드)        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Staging (스테이징)                              │
├─────────────────────────────────────────────────┤
│  - AWS 단일 계정, 별도 VPC                        │
│  - 프로덕션과 동일한 구성 (축소 버전)              │
│  - CI/CD 자동 배포                               │
│  - 비용: ~$200/month                            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Production (프로덕션)                           │
├─────────────────────────────────────────────────┤
│  - AWS 별도 계정                                 │
│  - Multi-AZ, Auto-scaling                       │
│  - Enhanced monitoring                          │
│  - 비용: ~$500/month (MVP) → ~$3,500 (Year 1)   │
└─────────────────────────────────────────────────┘
```

---

## 2. AWS 서비스 구성

### 2-1. 전체 AWS 서비스 맵

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFlare                              │
│                     (CDN + DDoS Protection)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Route 53                               │
│                   (DNS Management)                              │
│                                                                 │
│  onno.app        → CloudFlare → ALB (Web)                       │
│  api.onno.app    → ALB (API)                                    │
│  ws.onno.app     → NLB (WebSocket)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                ↓                            ↓
┌──────────────────────────┐   ┌──────────────────────────┐
│   Application Load       │   │   Network Load           │
│   Balancer (ALB)         │   │   Balancer (NLB)         │
│                          │   │                          │
│   - HTTP/HTTPS           │   │   - WebSocket (TCP)      │
│   - SSL Termination      │   │   - Sticky Sessions      │
│   - Health Checks        │   │   - Low Latency          │
└──────────────────────────┘   └──────────────────────────┘
            │                               │
            ↓                               ↓
┌────────────────────────────────────────────────────────────────┐
│                         VPC (10.0.0.0/16)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Public Subnet (10.0.1.0/24, 10.0.2.0/24)             │   │
│  │  - NAT Gateway (Multi-AZ)                             │   │
│  │  - Bastion Host (관리용)                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Private Subnet - App (10.0.11.0/24, 10.0.12.0/24)    │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │   ECS        │  │   ECS        │  │   Lambda    │ │   │
│  │  │   (API)      │  │   (WS)       │  │   (Jobs)    │ │   │
│  │  │              │  │              │  │             │ │   │
│  │  │  Fargate     │  │  Fargate     │  │  - Post-    │ │   │
│  │  │  Tasks       │  │  Tasks       │  │    Meeting  │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Private Subnet - Data (10.0.21.0/24, 10.0.22.0/24)   │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │  RDS         │  │  ElastiCache │                  │   │
│  │  │  PostgreSQL  │  │  Redis       │                  │   │
│  │  │              │  │              │                  │   │
│  │  │  Multi-AZ    │  │  Cluster     │                  │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   S3     │  │ Secrets  │  │   SES    │  │   SNS    │       │
│  │          │  │ Manager  │  │ (Email)  │  │ (Alerts) │       │
│  │  Audio   │  │          │  │          │  │          │       │
│  │  Files   │  │ API Keys │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │CloudWatch│  │   ECR    │  │   IAM    │                     │
│  │ (Logs &  │  │ (Docker  │  │  (Roles) │                     │
│  │ Metrics) │  │ Images)  │  │          │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2-2. 서비스별 역할

| AWS 서비스 | 역할 | 구성 | 비용 (MVP) |
|-----------|------|------|-----------|
| **Route 53** | DNS 관리 | Hosted Zone 1개 | $0.50/month |
| **CloudFlare** | CDN, DDoS, SSL | Free Plan | $0 |
| **ALB** | HTTP 로드 밸런서 | 2 AZ | $25/month |
| **NLB** | WebSocket 로드 밸런서 | 2 AZ | $25/month |
| **ECS Fargate** | 컨테이너 실행 (API) | 2 tasks × 0.5vCPU, 1GB RAM | $30/month |
| **ECS Fargate** | 컨테이너 실행 (WS) | 2 tasks × 0.5vCPU, 1GB RAM | $30/month |
| **Lambda** | 비동기 작업 (배치) | 1GB, 3분 timeout | ~$5/month |
| **RDS PostgreSQL** | Primary Database | db.t3.micro (Multi-AZ) | $30/month |
| **ElastiCache Redis** | Cache & Queue | cache.t3.micro | $20/month |
| **S3** | 오디오 파일 저장 | 100GB | $3/month |
| **ECR** | Docker 이미지 저장 | 10GB | $1/month |
| **Secrets Manager** | 비밀키 관리 | 5 secrets | $2/month |
| **CloudWatch** | 로그 & 메트릭 | 10GB logs | $10/month |
| **SES** | 이메일 발송 | 1,000 emails/month | $0.10 |
| **SNS** | 알람 | 100 notifications | $0 |
| **VPC** | 네트워크 | NAT Gateway | $35/month |
| **IAM** | 권한 관리 | Free | $0 |
| | | **총 MVP 비용** | **~$216/month** |

---

### 2-3. 외부 서비스

| 서비스 | 역할 | 플랜 | 비용 |
|--------|------|------|------|
| **Vercel** | Frontend 호스팅 | Pro | $20/month |
| **OpenAI API** | STT, LLM, Embeddings | Pay-as-you-go | ~$250/month |
| **Pinecone** | Vector DB | Starter | $70/month |
| **GitHub** | 코드 저장소 & CI/CD | Free (Public) | $0 |
| **Sentry** | 에러 추적 | Developer | $26/month |
| | | **총 외부 서비스** | **~$366/month** |

**총 인프라 비용 (MVP)**: ~$582/month (~$7,000/year)

---

## 3. 네트워크 아키텍처

### 3-1. VPC 설계

```
VPC: 10.0.0.0/16 (65,536 IPs)

┌─────────────────────────────────────────────────────────────┐
│  Region: ap-northeast-2 (Seoul)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Availability Zone A (ap-northeast-2a)              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Public Subnet A (10.0.1.0/24 - 256 IPs)           │   │
│  │  - NAT Gateway A                                    │   │
│  │  - Bastion Host A                                   │   │
│  │                                                     │   │
│  │  Private Subnet A - App (10.0.11.0/24)             │   │
│  │  - ECS Task (API) A                                 │   │
│  │  - ECS Task (WS) A                                  │   │
│  │                                                     │   │
│  │  Private Subnet A - Data (10.0.21.0/24)            │   │
│  │  - RDS Primary                                      │   │
│  │  - ElastiCache Node 1                               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Availability Zone B (ap-northeast-2b)              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Public Subnet B (10.0.2.0/24 - 256 IPs)           │   │
│  │  - NAT Gateway B                                    │   │
│  │                                                     │   │
│  │  Private Subnet B - App (10.0.12.0/24)             │   │
│  │  - ECS Task (API) B                                 │   │
│  │  - ECS Task (WS) B                                  │   │
│  │                                                     │   │
│  │  Private Subnet B - Data (10.0.22.0/24)            │   │
│  │  - RDS Standby (Multi-AZ)                           │   │
│  │  - ElastiCache Node 2                               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3-2. Security Groups

```
┌──────────────────────────────────────────────────────────┐
│  SG-ALB (Application Load Balancer)                      │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 443 (HTTPS) from 0.0.0.0/0                       │
│  - Port 80 (HTTP) from 0.0.0.0/0 (redirect to 443)      │
│                                                          │
│  Outbound:                                               │
│  - Port 3000 to SG-ECS-API                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SG-NLB (Network Load Balancer)                          │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 443 (WSS) from 0.0.0.0/0                         │
│                                                          │
│  Outbound:                                               │
│  - Port 3001 to SG-ECS-WS                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SG-ECS-API (API Server Tasks)                           │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 3000 from SG-ALB                                 │
│  - Port 22 from SG-Bastion (SSH for debugging)          │
│                                                          │
│  Outbound:                                               │
│  - Port 5432 to SG-RDS                                   │
│  - Port 6379 to SG-Redis                                 │
│  - Port 443 to 0.0.0.0/0 (OpenAI API, Pinecone)         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SG-ECS-WS (WebSocket Server Tasks)                      │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 3001 from SG-NLB                                 │
│                                                          │
│  Outbound:                                               │
│  - Port 5432 to SG-RDS                                   │
│  - Port 6379 to SG-Redis                                 │
│  - Port 443 to 0.0.0.0/0 (OpenAI API)                    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SG-RDS (PostgreSQL)                                     │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 5432 from SG-ECS-API                             │
│  - Port 5432 from SG-ECS-WS                              │
│  - Port 5432 from SG-Lambda                              │
│  - Port 5432 from SG-Bastion                             │
│                                                          │
│  Outbound:                                               │
│  - None                                                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SG-Redis (ElastiCache)                                  │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 6379 from SG-ECS-API                             │
│  - Port 6379 from SG-ECS-WS                              │
│  - Port 6379 from SG-Lambda                              │
│                                                          │
│  Outbound:                                               │
│  - None                                                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SG-Bastion (관리용 접속 서버)                            │
├──────────────────────────────────────────────────────────┤
│  Inbound:                                                │
│  - Port 22 (SSH) from 사무실 IP (화이트리스트)            │
│                                                          │
│  Outbound:                                               │
│  - Port 22 to SG-ECS-API                                 │
│  - Port 5432 to SG-RDS                                   │
│  - Port 6379 to SG-Redis                                 │
└──────────────────────────────────────────────────────────┘
```

---

### 3-3. NAT Gateway 설계

```
┌───────────────────────────────────────────────────────┐
│  NAT Gateway Strategy                                 │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Multi-AZ NAT (고가용성):                              │
│  - NAT Gateway A (Public Subnet A)                    │
│  - NAT Gateway B (Public Subnet B)                    │
│                                                       │
│  Private Subnet → NAT Gateway → Internet Gateway      │
│                                                       │
│  비용: $35/month × 2 = $70/month                      │
│  (1 NAT Gateway = $0.045/hour + 데이터 전송)          │
│                                                       │
│  대안 (비용 절감):                                     │
│  - Single NAT Gateway (AZ-A만)                        │
│  - NAT Instance (t3.nano) - 관리 부담 증가             │
│  - VPC Endpoint (S3, ECR 등) - NAT 사용 감소          │
│                                                       │
│  MVP 추천: Single NAT Gateway (비용↓, 단순성↑)         │
└───────────────────────────────────────────────────────┘
```

---

## 4. 컴퓨팅 인프라

### 4-1. ECS Fargate (API Server)

```yaml
# ecs/api-task-definition.json

{
  "family": "onno-api-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",        # 0.5 vCPU
  "memory": "1024",    # 1GB RAM
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api-server",
      "image": "ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/onno-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-2:ACCOUNT_ID:secret:onno/db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-2:ACCOUNT_ID:secret:onno/jwt-secret"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-2:ACCOUNT_ID:secret:onno/openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/onno-api",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "api"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

---

#### ECS Service 설정

```yaml
# ecs/api-service.json

{
  "serviceName": "onno-api-service",
  "cluster": "onno-cluster",
  "taskDefinition": "onno-api-task:LATEST",
  "desiredCount": 2,    # 최소 2개 태스크 (Multi-AZ)
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-xxxxxxxxx",  # Private Subnet A
        "subnet-yyyyyyyyy"   # Private Subnet B
      ],
      "securityGroups": ["sg-xxxxxxxxx"],  # SG-ECS-API
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:...",
      "containerName": "api-server",
      "containerPort": 3000
    }
  ],
  "healthCheckGracePeriodSeconds": 60,
  "deploymentConfiguration": {
    "maximumPercent": 200,      # Rolling update
    "minimumHealthyPercent": 100
  }
}
```

---

#### Auto Scaling

```yaml
# Auto Scaling Policy (Target Tracking)

{
  "ScalableTargetSpecification": {
    "ServiceNamespace": "ecs",
    "ResourceId": "service/onno-cluster/onno-api-service",
    "ScalableDimension": "ecs:service:DesiredCount",
    "MinCapacity": 2,
    "MaxCapacity": 10
  },
  "TargetTrackingScalingPolicyConfiguration": {
    "TargetValue": 70.0,  # CPU 70% 기준
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,   # 5분
    "ScaleOutCooldown": 60    # 1분
  }
}

# Scheduled Scaling (예상 트래픽 패턴)
# 평일 오전 9-18시: 최소 4 tasks
# 그 외 시간: 최소 2 tasks
```

---

### 4-2. ECS Fargate (WebSocket Server)

```yaml
# ecs/ws-task-definition.json

{
  "family": "onno-ws-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "ws-server",
      "image": "ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/onno-ws:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "WS_PORT",
          "value": "3001"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://onno-redis.xxxxxx.cache.amazonaws.com:6379"
        }
      ],
      "secrets": [
        # ... (API와 동일)
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/onno-ws",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "ws"
        }
      }
    }
  ]
}
```

**WebSocket Sticky Sessions**:
- NLB는 Source IP 기반 Sticky Session 지원
- Target Group: `Stickiness: enabled, type: source_ip`
- 동일 클라이언트는 동일 서버로 라우팅

---

### 4-3. AWS Lambda (Background Jobs)

```yaml
# lambda/post-meeting-processor.py

import json
import boto3
import os

# Environment variables
DATABASE_URL = os.environ['DATABASE_URL']
OPENAI_API_KEY = os.environ['OPENAI_API_KEY']

def lambda_handler(event, context):
    """
    회의 종료 후 배치 처리
    - 액션 아이템 추출
    - 관계 데이터 추출
    - 요약 생성
    - 임베딩 생성
    """
    meeting_id = event['meeting_id']
    tasks = event.get('tasks', [])

    results = {}

    for task in tasks:
        if task == 'extract_action_items':
            results[task] = extract_action_items(meeting_id)
        elif task == 'extract_relationship_data':
            results[task] = extract_relationship_data(meeting_id)
        elif task == 'generate_summary':
            results[task] = generate_summary(meeting_id)
        elif task == 'create_embeddings':
            results[task] = create_embeddings(meeting_id)
        elif task == 'send_email_summary':
            results[task] = send_email_summary(meeting_id)

    return {
        'statusCode': 200,
        'body': json.dumps(results)
    }

# Lambda Configuration
Config = {
    "FunctionName": "onno-post-meeting-processor",
    "Runtime": "python3.11",
    "Handler": "index.lambda_handler",
    "Timeout": 180,  # 3분
    "MemorySize": 1024,  # 1GB
    "Environment": {
        "Variables": {
            "DATABASE_URL": "...",
            "OPENAI_API_KEY": "...",
            "PINECONE_API_KEY": "..."
        }
    },
    "VpcConfig": {
        "SubnetIds": ["subnet-xxxxxxxx", "subnet-yyyyyyyy"],
        "SecurityGroupIds": ["sg-zzzzzzz"]  # SG-Lambda
    }
}
```

---

### 4-4. Bastion Host (관리용)

```bash
# EC2 Instance: t3.nano (최소 사양)
# Purpose: DB 접속, 디버깅

# 접속 방법
ssh -i onno-bastion-key.pem ec2-user@bastion.onno.app

# DB 접속 (포트 포워딩)
ssh -i onno-bastion-key.pem -L 5432:rds-endpoint:5432 ec2-user@bastion.onno.app

# 로컬에서 DB 접속
psql -h localhost -U postgres -d onno

# Security
- SSH Key만 허용 (비밀번호 비활성화)
- IP 화이트리스트 (사무실 IP만)
- Session Manager 사용 고려 (SSH 키 불필요)
```

---

## 5. 데이터 인프라

### 5-1. RDS PostgreSQL

```yaml
# RDS Instance Configuration

DBInstanceIdentifier: onno-db-prod
Engine: postgres
EngineVersion: "16.1"
DBInstanceClass: db.t3.micro  # MVP (2 vCPU, 1GB RAM)

# Storage
AllocatedStorage: 20  # GB
StorageType: gp3      # General Purpose SSD
MaxAllocatedStorage: 100  # Auto-scaling up to 100GB

# High Availability
MultiAZ: true         # Multi-AZ for failover
BackupRetentionPeriod: 7  # 7일 자동 백업
PreferredBackupWindow: "03:00-04:00"  # UTC (한국 시간 12-13시)
PreferredMaintenanceWindow: "mon:04:00-mon:05:00"

# Network
VPCSecurityGroups:
  - sg-xxxxxxxxx  # SG-RDS
DBSubnetGroupName: onno-db-subnet-group
PubliclyAccessible: false

# Encryption
StorageEncrypted: true
KmsKeyId: "arn:aws:kms:ap-northeast-2:ACCOUNT_ID:key/xxxxx"

# Performance
EnablePerformanceInsights: true
PerformanceInsightsRetentionPeriod: 7

# Monitoring
EnableCloudwatchLogsExports:
  - postgresql
  - upgrade

# Parameters
DBParameterGroupName: onno-postgres-params
# Custom parameters:
# - max_connections: 100
# - shared_buffers: 256MB
# - work_mem: 4MB
# - maintenance_work_mem: 64MB
# - effective_cache_size: 768MB
```

---

#### Connection Pooling (Prisma)

```typescript
// config/database.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection pool settings (in DATABASE_URL)
// ?connection_limit=20&pool_timeout=10
```

---

#### Read Replica (Year 1+)

```yaml
# Year 1: 트래픽 증가 시 Read Replica 추가

ReadReplica:
  DBInstanceIdentifier: onno-db-read-replica
  SourceDBInstanceIdentifier: onno-db-prod
  DBInstanceClass: db.t3.micro
  AvailabilityZone: ap-northeast-2c
  PubliclyAccessible: false

# Application 수정
# Read queries → Read Replica
# Write queries → Primary

prisma.$transaction([
  prisma.meeting.findMany(), // → Read Replica
  prisma.user.create({ ... }), // → Primary
]);
```

---

### 5-2. ElastiCache Redis

```yaml
# Redis Cluster Configuration

CacheClusterId: onno-redis-prod
Engine: redis
EngineVersion: "7.0"
CacheNodeType: cache.t3.micro  # MVP (2 vCPU, 0.5GB RAM)

# Cluster Mode
NumCacheNodes: 2  # 2-node replication
ReplicationGroupId: onno-redis-replication
AutomaticFailoverEnabled: true

# Network
CacheSubnetGroupName: onno-redis-subnet-group
SecurityGroupIds:
  - sg-yyyyyyyyy  # SG-Redis
PreferredAvailabilityZones:
  - ap-northeast-2a
  - ap-northeast-2b

# Encryption
AtRestEncryptionEnabled: true
TransitEncryptionEnabled: true
AuthToken: "stored-in-secrets-manager"

# Backup
SnapshotRetentionLimit: 5
SnapshotWindow: "03:00-05:00"
PreferredMaintenanceWindow: "mon:05:00-mon:06:00"

# Notifications
NotificationTopicArn: "arn:aws:sns:ap-northeast-2:ACCOUNT_ID:redis-alerts"
```

---

#### Redis Usage Pattern

```typescript
// config/redis.ts

import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_AUTH_TOKEN,
  socket: {
    tls: true,
    rejectUnauthorized: true,
  },
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

await redisClient.connect();

export { redisClient as redis };

// 사용 예시

// 1. Session Storage
await redis.set(`session:${userId}`, JSON.stringify(sessionData), {
  EX: 7 * 24 * 60 * 60, // 7일
});

// 2. Rate Limiting
const key = `rl:api:${userId}`;
const current = await redis.incr(key);
if (current === 1) {
  await redis.expire(key, 60); // 1분
}
if (current > 100) {
  throw new Error('Rate limit exceeded');
}

// 3. Cache (자주 쓰는 질문 템플릿)
const cached = await redis.get(`questions:${domain}:${level}`);
if (cached) {
  return JSON.parse(cached);
}
const questions = await generateQuestions();
await redis.set(`questions:${domain}:${level}`, JSON.stringify(questions), {
  EX: 3600, // 1시간
});

// 4. Queue (BullMQ)
import { Queue } from 'bullmq';

const postMeetingQueue = new Queue('post-meeting-processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls: true,
  },
});

await postMeetingQueue.add('process', {
  meeting_id: 'meeting_123',
  tasks: ['extract_actions', 'create_embeddings'],
});
```

---

### 5-3. S3 (Object Storage)

```yaml
# S3 Bucket Configuration

Buckets:
  1. onno-audio-files-prod
     - Purpose: 회의 녹음 파일
     - Lifecycle:
       - 30일 후 Glacier로 아카이브
       - 90일 후 삭제 (사용자 설정 가능)
     - Encryption: AES-256
     - Versioning: Disabled
     - Public Access: Blocked

  2. onno-user-uploads-prod
     - Purpose: 사용자 업로드 파일 (PDF, Excel 등)
     - Lifecycle:
       - 365일 후 Glacier로 아카이브
     - Encryption: AES-256
     - Versioning: Enabled
     - Public Access: Blocked

  3. onno-backups-prod
     - Purpose: DB 백업, 로그 아카이브
     - Lifecycle:
       - 90일 후 Glacier로 아카이브
       - 365일 후 삭제
     - Encryption: AES-256
     - Versioning: Enabled

# Cost Optimization
- S3 Intelligent-Tiering (자동 계층 이동)
- CloudFront CDN (정적 파일 캐싱)
```

---

#### S3 Upload/Download

```typescript
// services/s3.service.ts

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const s3Service = {
  // 파일 업로드
  async uploadAudioFile(
    meetingId: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const key = `meetings/${meetingId}/audio-${Date.now()}.webm`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: 'onno-audio-files-prod',
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          meeting_id: meetingId,
          uploaded_at: new Date().toISOString(),
        },
      })
    );

    return `s3://onno-audio-files-prod/${key}`;
  },

  // Presigned URL 생성 (다운로드용)
  async getDownloadUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: 'onno-audio-files-prod',
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  },

  // 파일 삭제
  async deleteFile(s3Key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: 'onno-audio-files-prod',
        Key: s3Key,
      })
    );
  },
};
```

---

### 5-4. AWS Secrets Manager

```yaml
# Secrets Configuration

Secrets:
  1. onno/db-url
     Value: "postgresql://username:password@rds-endpoint:5432/onno?ssl=true"

  2. onno/jwt-secret
     Value: "randomly-generated-256-bit-secret"

  3. onno/openai-api-key
     Value: "sk-proj-xxxxx"

  4. onno/pinecone-api-key
     Value: "pcsk_xxxxx"

  5. onno/redis-auth-token
     Value: "redis-auth-token"

  6. onno/stripe-api-key
     Value: "sk_live_xxxxx"

# Rotation
- JWT Secret: 매 90일 자동 rotation
- DB Password: 매 30일 자동 rotation (Lambda 함수)

# Access
- ECS Task Role에 권한 부여
- Lambda Execution Role에 권한 부여

IAM Policy:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:ap-northeast-2:ACCOUNT_ID:secret:onno/*"
    }
  ]
}
```

---

## 6. CI/CD 파이프라인

### 6-1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml

name: Deploy to Production

on:
  push:
    branches:
      - main

env:
  AWS_REGION: ap-northeast-2
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-northeast-2.amazonaws.com
  ECS_CLUSTER: onno-cluster

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: onno_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/onno_test

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/onno_test
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test coverage
        uses: codecov/codecov-action@v3

  build-and-deploy-api:
    name: Build & Deploy API Server
    needs: test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build Docker image
        run: |
          docker build -t onno-api:${{ github.sha }} \
            -f backend/Dockerfile \
            backend/

      - name: Tag and push image
        run: |
          docker tag onno-api:${{ github.sha }} \
            ${{ env.ECR_REGISTRY }}/onno-api:latest
          docker tag onno-api:${{ github.sha }} \
            ${{ env.ECR_REGISTRY }}/onno-api:${{ github.sha }}

          docker push ${{ env.ECR_REGISTRY }}/onno-api:latest
          docker push ${{ env.ECR_REGISTRY }}/onno-api:${{ github.sha }}

      - name: Download task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition onno-api-task \
            --query taskDefinition > task-definition.json

      - name: Update task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: api-server
          image: ${{ env.ECR_REGISTRY }}/onno-api:${{ github.sha }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: onno-api-service
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ API Server deployed to production (SHA: ${{ github.sha }})"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  build-and-deploy-ws:
    name: Build & Deploy WebSocket Server
    needs: test
    runs-on: ubuntu-latest

    steps:
      # ... (API와 동일, image 이름만 onno-ws로 변경)

  run-migrations:
    name: Run Database Migrations
    needs: [build-and-deploy-api, build-and-deploy-ws]
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Notify if migration failed
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Database migration FAILED for SHA ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

### 6-2. Dockerfile (API Server)

```dockerfile
# backend/Dockerfile

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init (proper signal handling)
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/server.js"]
```

---

### 6-3. Deployment Strategy

```
┌───────────────────────────────────────────────────────┐
│  Blue-Green Deployment (ECS)                          │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Current State (Blue):                                │
│  - 2 tasks running (v1.0.0)                           │
│  - ALB → Blue Target Group                            │
│                                                       │
│  Deployment Process:                                  │
│  1. Create new task definition (v1.1.0)               │
│  2. Start 2 new tasks (Green)                         │
│  3. Wait for health checks (60s grace period)         │
│  4. Green tasks healthy → ALB switches to Green       │
│  5. Monitor for 5 minutes                             │
│  6. If OK: Terminate Blue tasks                       │
│  7. If ERROR: Rollback to Blue (30초 내)              │
│                                                       │
│  Rollback:                                            │
│  - ALB switches back to Blue Target Group             │
│  - Green tasks terminated                             │
│  - Total downtime: < 30초                             │
│                                                       │
└───────────────────────────────────────────────────────┘

ECS Deployment Configuration:
- maximumPercent: 200%        # 기존 + 새 태스크 동시 실행
- minimumHealthyPercent: 100% # 항상 최소 100% 유지
- Circuit Breaker: Enabled    # 3회 실패 시 자동 롤백
```

---

### 6-4. Database Migration Strategy

```
┌───────────────────────────────────────────────────────┐
│  Zero-Downtime Migration Strategy                    │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Phase 1: Additive Changes (새 컬럼 추가)             │
│  1. Deploy migration: ALTER TABLE ADD COLUMN          │
│  2. 기존 코드는 새 컬럼 무시 (호환성 유지)             │
│  3. Deploy 새 코드 (새 컬럼 사용 시작)                │
│  4. 데이터 마이그레이션 (배치 작업)                    │
│                                                       │
│  Phase 2: Removal (구 컬럼 삭제)                      │
│  5. 모든 코드가 새 컬럼 사용 확인                      │
│  6. 일주일 후 구 컬럼 삭제 migration                   │
│                                                       │
│  Example:                                             │
│  ├ Migration 1: ADD COLUMN email_new VARCHAR(255)     │
│  ├ Migration 2: UPDATE users SET email_new = email    │
│  ├ Code Deploy: 새 코드 배포 (email_new 사용)         │
│  ├ Wait: 1 week                                       │
│  └ Migration 3: DROP COLUMN email                     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 7. 모니터링 & 로깅

### 7-1. CloudWatch Logs

```yaml
# Log Groups

/ecs/onno-api
  - Retention: 30 days
  - Filter Patterns:
    - [ERROR] → SNS 알람
    - [WARN] → CloudWatch Dashboard

/ecs/onno-ws
  - Retention: 30 days
  - Real-time WebSocket metrics

/aws/lambda/onno-post-meeting-processor
  - Retention: 14 days

/aws/rds/instance/onno-db-prod/postgresql
  - Retention: 7 days

# CloudWatch Insights Queries

# 1. API 에러율
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() as error_count by bin(5m)

# 2. Latency 분석
fields @timestamp, duration
| filter @type = "REPORT"
| stats avg(duration), max(duration), pct(duration, 95) by bin(5m)

# 3. 특정 사용자 활동
fields @timestamp, userId, action
| filter userId = "user_123"
| sort @timestamp desc
| limit 100
```

---

### 7-2. CloudWatch Metrics & Alarms

```yaml
# Custom Metrics (Application)

Namespace: Onno/Application

Metrics:
  1. MeetingDuration
     - Unit: Seconds
     - Dimensions: [UserId, MeetingType]

  2. STT_Latency
     - Unit: Milliseconds
     - Dimensions: [Region]

  3. Question_Generation_Latency
     - Unit: Milliseconds
     - Dimensions: [MeetingType, Priority]

  4. API_Error_Rate
     - Unit: Percent
     - Dimensions: [Endpoint, StatusCode]

  5. WebSocket_Connections
     - Unit: Count
     - Dimensions: [Server]

# Application Code
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatch({ region: 'ap-northeast-2' });

await cloudwatch.putMetricData({
  Namespace: 'Onno/Application',
  MetricData: [
    {
      MetricName: 'STT_Latency',
      Value: latencyMs,
      Unit: 'Milliseconds',
      Timestamp: new Date(),
      Dimensions: [
        { Name: 'Region', Value: 'ap-northeast-2' },
      ],
    },
  ],
});

---

# CloudWatch Alarms

Alarms:
  1. API_High_Error_Rate
     Metric: AWS/ApplicationELB/TargetResponseTime
     Threshold: > 5% error rate
     Period: 5 minutes
     Evaluation: 2 consecutive periods
     Actions:
       - SNS Topic: onno-critical-alerts
       - Auto-scaling trigger (scale up)

  2. Database_CPU_High
     Metric: AWS/RDS/CPUUtilization
     Threshold: > 80%
     Period: 5 minutes
     Evaluation: 2 consecutive periods
     Actions:
       - SNS Topic: onno-critical-alerts

  3. ECS_Task_Crash
     Metric: AWS/ECS/CPUUtilization
     Threshold: < 10% (no tasks running)
     Period: 1 minute
     Evaluation: 1 period
     Actions:
       - SNS Topic: onno-critical-alerts
       - PagerDuty (휴대폰 알림)

  4. WebSocket_Connection_Drop
     Metric: Onno/Application/WebSocket_Connections
     Threshold: < 50% of normal
     Period: 2 minutes
     Evaluation: 1 period
     Actions:
       - SNS Topic: onno-warnings

  5. OpenAI_API_Latency_High
     Metric: Onno/Application/STT_Latency
     Threshold: > 2000ms (2초)
     Period: 5 minutes
     Evaluation: 2 consecutive periods
     Actions:
       - SNS Topic: onno-warnings
```

---

### 7-3. Application Performance Monitoring (APM)

```typescript
// Sentry Integration

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.GIT_SHA,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% 트랜잭션 샘플링

  // Profiling
  profilesSampleRate: 0.1,
  integrations: [
    new ProfilingIntegration(),
  ],

  // Error filtering
  beforeSend(event, hint) {
    // 민감한 정보 제거
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['authorization'];
    }
    return event;
  },
});

// Usage
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handler
app.use(Sentry.Handlers.errorHandler());

// Custom transaction
const transaction = Sentry.startTransaction({
  op: 'meeting.create',
  name: 'Create Meeting',
});

try {
  const meeting = await createMeeting(data);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  Sentry.captureException(error);
} finally {
  transaction.finish();
}
```

---

### 7-4. Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Onno Production Dashboard (CloudWatch)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ API Health   │  │ WS Health    │  │ DB Health    │     │
│  │ ────────────│  │ ────────────│  │ ────────────│     │
│  │ ✅ Healthy   │  │ ✅ Healthy   │  │ ✅ Healthy   │     │
│  │ 2/2 tasks    │  │ 2/2 tasks    │  │ CPU: 45%     │     │
│  │ CPU: 35%     │  │ CPU: 28%     │  │ Conn: 15/100 │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  API Request Rate                                 │     │
│  │  ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂▁ (last 1 hour)             │     │
│  │  Current: 45 req/min                              │     │
│  │  Peak: 120 req/min                                │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Response Time (p95)                              │     │
│  │  ▁▁▁▂▂▃▃▃▂▂▁▁▁▂▂▃▃▃▂▂ (last 1 hour)               │     │
│  │  Current: 285ms                                   │     │
│  │  Target: < 500ms                                  │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Active Meetings                                  │     │
│  │  Current: 8 meetings                              │     │
│  │  WebSocket Connections: 32                        │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  AI Service Metrics                               │     │
│  │  STT Latency (avg): 520ms                         │     │
│  │  Question Gen (avg): 780ms                        │     │
│  │  OpenAI Cost (today): $12.50                      │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  Recent Errors (last 1 hour)                      │     │
│  │  [ERROR] 2 × Database connection timeout          │     │
│  │  [WARN] 5 × STT API slow response (>1s)           │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 비용 최적화

### 8-1. 비용 분석 (MVP → Year 1)

```
┌──────────────────────────────────────────────────────────┐
│  MVP (100 users, 500 meetings/month)                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  AWS Infrastructure:                    $216/month       │
│  ├─ ECS Fargate (API + WS)              $60             │
│  ├─ RDS PostgreSQL (Multi-AZ)           $30             │
│  ├─ ElastiCache Redis                   $20             │
│  ├─ ALB + NLB                            $50             │
│  ├─ NAT Gateway                          $35             │
│  ├─ S3 (100GB)                           $3              │
│  ├─ CloudWatch Logs (10GB)               $10             │
│  ├─ Lambda                               $5              │
│  └─ 기타 (Secrets, ECR, SES)             $3              │
│                                                          │
│  External Services:                      $366/month      │
│  ├─ OpenAI API                           $250            │
│  ├─ Pinecone                             $70             │
│  ├─ Sentry                               $26             │
│  └─ Vercel                               $20             │
│                                                          │
│  총 월 비용:                             $582/month      │
│  연 비용:                                $6,984/year     │
│                                                          │
│  사용자당 비용: $5.82/month/user                         │
│  회의당 비용: $1.16/meeting                              │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Year 1 (1,200 users, 6,000 meetings/month)             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  AWS Infrastructure:                    $800/month       │
│  ├─ ECS Fargate (8 tasks)                $240            │
│  ├─ RDS PostgreSQL (db.t3.small)         $60             │
│  ├─ ElastiCache Redis (cache.t3.small)   $40             │
│  ├─ ALB + NLB                            $80             │
│  ├─ NAT Gateway                          $70             │
│  ├─ S3 (1TB)                             $30             │
│  ├─ CloudWatch Logs (100GB)              $100            │
│  ├─ Lambda                               $50             │
│  └─ 기타                                  $130            │
│                                                          │
│  External Services:                      $2,700/month    │
│  ├─ OpenAI API                           $2,500          │
│  ├─ Pinecone                             $70             │
│  ├─ Sentry                               $80             │
│  └─ Vercel                               $50             │
│                                                          │
│  총 월 비용:                             $3,500/month    │
│  연 비용:                                $42,000/year    │
│                                                          │
│  사용자당 비용: $2.92/month/user (↓ 50%)                 │
│  회의당 비용: $0.58/meeting (↓ 50%)                      │
│                                                          │
│  MRR 목표: $24,000 (Break-even 14.6%)                   │
│  Gross Margin: 85.4% ✅                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 8-2. 비용 최적화 전략

```
1. Reserved Instances (장기 할인)
   ─────────────────────────────────
   Year 1+ RDS, ElastiCache Reserved로 전환
   - 1년 예약: ~30% 절감
   - 3년 예약: ~60% 절감

   예상 절감: $50/month (Year 1)

2. Savings Plans (Compute)
   ─────────────────────────────────
   ECS Fargate Compute Savings Plan
   - 1년 약정: ~20% 절감

   예상 절감: $50/month (Year 1)

3. S3 Lifecycle Policy
   ─────────────────────────────────
   오디오 파일:
   - 30일 후 → Glacier
   - 90일 후 → 삭제 (사용자 설정)

   예상 절감: 70% storage cost
   → $21/month saved (Year 1)

4. CloudWatch Logs Retention
   ─────────────────────────────────
   로그 보존 기간 축소:
   - API/WS: 30일 → 14일
   - Lambda: 14일 → 7일

   예상 절감: $30/month (Year 1)

5. AI API Cost Optimization
   ─────────────────────────────────
   a) Model Selection
      - Critical 질문: GPT-4o
      - Follow-up 질문: GPT-4o-mini (80% 저렴)

      예상 절감: $500/month (Year 1)

   b) Caching
      - 동일 질문 캐싱 (Redis)
      - Hit rate 20% 가정

      예상 절감: $200/month (Year 1)

   c) Batch Processing
      - 실시간 아닌 작업은 배치로
      - 요약, 임베딩 등

      예상 절감: $100/month (Year 1)

6. VPC Endpoint (NAT 비용 감소)
   ─────────────────────────────────
   S3, ECR VPC Endpoint 사용
   → NAT Gateway 트래픽 감소

   예상 절감: $20/month (Year 1)

7. Spot Instances (Lambda Alternative)
   ─────────────────────────────────────
   배치 작업용 Spot Instance
   - 70% 저렴
   - Interruption 허용 가능한 작업만

   예상 절감: $30/month (Year 1)

─────────────────────────────────────────────
총 예상 절감 (Year 1):
$50 + $50 + $21 + $30 + $500 + $200 + $100 + $20 + $30
= $1,001/month
= $12,012/year

최적화 후 Year 1 비용: $2,499/month (↓ 28.6%)
```

---

### 8-3. Cost Monitoring

```typescript
// AWS Cost Explorer API

import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';

const costClient = new CostExplorerClient({ region: 'us-east-1' });

// 일일 비용 조회
const command = new GetCostAndUsageCommand({
  TimePeriod: {
    Start: '2025-12-01',
    End: '2025-12-02',
  },
  Granularity: 'DAILY',
  Metrics: ['UnblendedCost'],
  GroupBy: [
    {
      Type: 'DIMENSION',
      Key: 'SERVICE',
    },
  ],
});

const response = await costClient.send(command);

// Slack 알림 (예산 초과 시)
if (dailyCost > BUDGET_THRESHOLD) {
  await sendSlackAlert(`⚠️ Daily cost exceeded: $${dailyCost} (Budget: $${BUDGET_THRESHOLD})`);
}

// CloudWatch Custom Metric
await cloudwatch.putMetricData({
  Namespace: 'Onno/Billing',
  MetricData: [
    {
      MetricName: 'DailyCost',
      Value: dailyCost,
      Unit: 'None',
      Timestamp: new Date(),
    },
  ],
});
```

---

## 9. Disaster Recovery

### 9-1. Backup Strategy

```
┌──────────────────────────────────────────────────────────┐
│  Backup & Recovery Plan                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Database (RDS PostgreSQL)                            │
│     ────────────────────────────                        │
│     - Automated Backups: 일 1회 (03:00-04:00 UTC)       │
│     - Retention: 7일                                     │
│     - Manual Snapshots: 주 1회 (일요일)                  │
│     - Retention: 30일                                    │
│     - Point-in-Time Recovery: 가능 (5분 단위)            │
│                                                          │
│     RPO (Recovery Point Objective): 5분                 │
│     RTO (Recovery Time Objective): 15분                 │
│                                                          │
│  2. Redis (ElastiCache)                                  │
│     ────────────────────────────                        │
│     - Automated Backups: 일 1회                          │
│     - Retention: 5일                                     │
│                                                          │
│     RPO: 24시간                                          │
│     RTO: 30분                                            │
│                                                          │
│  3. S3 (오디오 파일)                                      │
│     ────────────────────────────                        │
│     - Versioning: Enabled                                │
│     - Cross-Region Replication: Enabled (ap-northeast-1) │
│     - Lifecycle: 30일 후 Glacier                         │
│                                                          │
│     RPO: 0 (실시간 복제)                                 │
│     RTO: 즉시 (다른 리전에서 접근)                        │
│                                                          │
│  4. Application Code                                     │
│     ────────────────────────────                        │
│     - GitHub (Primary)                                   │
│     - ECR (Docker images)                                │
│     - 태그: v1.0.0, v1.1.0, ... (모든 릴리스 보관)       │
│                                                          │
│     RPO: 0 (Git commit 단위)                             │
│     RTO: 5분 (재배포)                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 9-2. Disaster Recovery Procedures

```
┌──────────────────────────────────────────────────────────┐
│  DR Scenario 1: RDS 장애 (Primary DB 다운)               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. 감지 (CloudWatch Alarm)                              │
│     - RDS_CPU_Utilization = 0                            │
│     - RDS_DatabaseConnections = 0                        │
│     → SNS → PagerDuty → 담당자 휴대폰 알림               │
│                                                          │
│  2. 자동 Failover (Multi-AZ)                             │
│     - AWS가 자동으로 Standby로 전환                       │
│     - DNS 엔드포인트 자동 변경                            │
│     - 다운타임: 1-2분                                    │
│                                                          │
│  3. 수동 복구 (Failover 실패 시)                          │
│     a) 최신 스냅샷에서 복구                               │
│        aws rds restore-db-instance-from-snapshot \      │
│          --db-instance-identifier onno-db-restored \    │
│          --db-snapshot-identifier <latest-snapshot>     │
│                                                          │
│     b) 애플리케이션 DB 엔드포인트 변경                     │
│        DATABASE_URL 환경 변수 업데이트                    │
│                                                          │
│     c) ECS 태스크 재시작                                  │
│                                                          │
│     예상 복구 시간: 15분                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  DR Scenario 2: 리전 장애 (ap-northeast-2 전체 다운)     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. 감지                                                 │
│     - 모든 서비스 응답 없음                               │
│     - CloudWatch 대시보드 접근 불가                       │
│                                                          │
│  2. 다른 리전으로 전환 (ap-northeast-1)                   │
│                                                          │
│     a) S3 데이터 (자동)                                   │
│        - Cross-Region Replication으로 이미 복제됨         │
│        - 즉시 사용 가능                                   │
│                                                          │
│     b) RDS 복구                                          │
│        - ap-northeast-2의 최신 스냅샷 복사                │
│        - ap-northeast-1에서 복원                          │
│        - 예상 시간: 30분                                  │
│                                                          │
│     c) ECS 배포                                          │
│        - ECR 이미지 ap-northeast-1로 복사                 │
│        - 새 ECS 클러스터 생성                             │
│        - 태스크 배포                                      │
│        - 예상 시간: 20분                                  │
│                                                          │
│     d) DNS 전환                                          │
│        - Route 53 레코드 변경                             │
│        - api.onno.app → 새 ALB                            │
│        - TTL: 60초                                       │
│                                                          │
│  총 복구 시간: ~1시간                                     │
│  데이터 손실: 최대 5분 (RPO)                             │
│                                                          │
│  ※ Year 1+ Multi-Region Active-Active 고려               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 9-3. Runbook (운영 매뉴얼)

```markdown
# Onno Production Runbook

## 1. Common Issues

### Issue: API 응답 느림 (>1s)

**원인**:
- DB connection pool 고갈
- OpenAI API 지연
- 메모리 부족

**진단**:
```bash
# CloudWatch Logs 확인
aws logs tail /ecs/onno-api --since 10m --follow

# ECS 태스크 CPU/메모리 확인
aws ecs describe-tasks --cluster onno-cluster --tasks <task-id>
```

**해결**:
1. DB connection pool 확인
   - 현재 연결 수: `SELECT count(*) FROM pg_stat_activity;`
   - 최대 연결 수: `SHOW max_connections;`
   - 필요 시 connection_limit 증가

2. ECS 태스크 재시작
   ```bash
   aws ecs update-service --cluster onno-cluster \
     --service onno-api-service --force-new-deployment
   ```

3. Auto-scaling 수동 트리거
   ```bash
   aws application-autoscaling set-scalable-target \
     --min-capacity 4 --desired-capacity 4
   ```

---

### Issue: WebSocket 연결 끊김

**원인**:
- NLB health check 실패
- ECS 태스크 재시작
- 네트워크 불안정

**진단**:
```bash
# WebSocket 서버 로그
aws logs tail /ecs/onno-ws --since 10m --filter-pattern "disconnect"

# NLB target health
aws elbv2 describe-target-health --target-group-arn <tg-arn>
```

**해결**:
1. 클라이언트 자동 재연결 확인 (60초 내)
2. 심각한 경우: 태스크 재시작
3. Redis Pub/Sub 확인 (여러 WS 서버 간 메시지 동기화)

---

### Issue: Database Deadlock

**진단**:
```sql
SELECT * FROM pg_stat_activity
WHERE wait_event_type = 'Lock';

-- Deadlock 확인
SELECT * FROM pg_locks
WHERE NOT granted;
```

**해결**:
1. 장기 실행 쿼리 종료
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active' AND query_start < now() - interval '5 minutes';
   ```

2. Deadlock 방지 (애플리케이션 수정)
   - 트랜잭션 순서 일관성 유지
   - Lock timeout 설정

---

## 2. Deployment Rollback

**긴급 롤백**:
```bash
# 이전 태스크 정의로 롤백
aws ecs update-service --cluster onno-cluster \
  --service onno-api-service \
  --task-definition onno-api-task:PREVIOUS_VERSION \
  --force-new-deployment

# 롤백 확인
aws ecs describe-services --cluster onno-cluster \
  --services onno-api-service
```

---

## 3. DB Migration Rollback

**마이그레이션 롤백**:
```bash
# Prisma migration 이력 확인
npx prisma migrate status

# 마지막 migration 롤백
npx prisma migrate resolve --rolled-back <migration-name>

# 수동 SQL 실행 (필요 시)
psql -h <rds-endpoint> -U postgres -d onno -f rollback.sql
```

---

## 4. Emergency Contacts

- CTO: +82-10-XXXX-XXXX
- DevOps: +82-10-YYYY-YYYY
- AWS Support: Premium Support (24/7)
- PagerDuty: onno.pagerduty.com
```

---

## 10. 확장 계획

### 10-1. Year 1 Scaling Plan

```
┌──────────────────────────────────────────────────────────┐
│  MVP → Year 1 Scaling Milestones                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Month 1-3 (100 → 300 users):                            │
│  ─────────────────────────────                          │
│  - 현재 인프라 유지                                       │
│  - Auto-scaling 테스트                                   │
│  - 모니터링 대시보드 개선                                 │
│  - 비용: ~$600/month                                     │
│                                                          │
│  Month 4-6 (300 → 600 users):                            │
│  ─────────────────────────────                          │
│  - RDS: db.t3.micro → db.t3.small (2x vCPU, 2GB RAM)    │
│  - ECS: 2 tasks → 4 tasks (Auto-scaling max: 8)         │
│  - ElastiCache: t3.micro → t3.small                      │
│  - 비용: ~$1,200/month                                   │
│                                                          │
│  Month 7-9 (600 → 900 users):                            │
│  ─────────────────────────────                          │
│  - RDS Read Replica 추가 (읽기 분산)                     │
│  - Redis Cluster 모드 전환 (5 노드)                      │
│  - CloudFront CDN 추가 (API 캐싱)                        │
│  - 비용: ~$2,000/month                                   │
│                                                          │
│  Month 10-12 (900 → 1,200 users):                        │
│  ─────────────────────────────                          │
│  - RDS: db.t3.small → db.t3.medium                       │
│  - ECS: Auto-scaling max 8 → 16 tasks                   │
│  - Reserved Instances 구매 (30% 절감)                    │
│  - 비용: ~$2,500/month (최적화 후)                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### 10-2. Year 3 Architecture (4,500 users)

```
┌─────────────────────────────────────────────────────────────┐
│  Year 3 Target Architecture                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Multi-Region Active-Active                                 │
│  ──────────────────────────                                │
│  Region 1: ap-northeast-2 (Seoul)                           │
│  Region 2: ap-northeast-1 (Tokyo)                           │
│                                                             │
│  Global Load Balancing:                                     │
│  - Route 53 Geolocation Routing                             │
│  - Latency-based Routing                                    │
│                                                             │
│  Database:                                                  │
│  - Aurora PostgreSQL Global Database                        │
│  - Primary: Seoul                                           │
│  - Secondary: Tokyo (1초 이내 복제)                          │
│  - Failover: < 1분                                          │
│                                                             │
│  Caching:                                                   │
│  - ElastiCache Global Datastore                             │
│  - Cross-region replication                                 │
│                                                             │
│  Compute:                                                   │
│  - ECS Fargate: 32 tasks (each region)                      │
│  - Lambda@Edge (CloudFront Functions)                       │
│                                                             │
│  예상 비용: ~$8,000/month                                   │
│  HA: 99.95% uptime                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 요약

이 **인프라 아키텍처 문서**는 Onno의 MVP부터 확장까지 전 단계를 커버합니다.

### 핵심 설계 결정

1. **클라우드**: AWS 서울 리전 (ap-northeast-2)
2. **컴퓨팅**: ECS Fargate (서버리스 컨테이너)
3. **데이터베이스**: RDS PostgreSQL Multi-AZ + ElastiCache Redis
4. **스토리지**: S3 + Lifecycle Policy
5. **네트워크**: VPC (Multi-AZ) + ALB + NLB
6. **CI/CD**: GitHub Actions → ECR → ECS
7. **모니터링**: CloudWatch + Sentry
8. **비용**: MVP $582/month → Year 1 $2,500/month (최적화 후)

### MVP 배포 준비 사항

- [x] AWS 계정 생성
- [x] VPC 설계 완료
- [x] RDS/Redis 구성 정의
- [x] ECS Task Definition 작성
- [x] CI/CD 파이프라인 정의
- [x] 모니터링 전략 수립
- [x] DR 계획 수립

이제 **세 번째 문서 (API 명세서)**를 작성하겠습니다!
