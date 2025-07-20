# 📦 MetaWave AWS Deployment Guide

This document walks you through setting up Ansible-based deployment for your MetaWave project on AWS. It assumes:

- You have AWS credentials configured (via `~/.aws/credentials` or environment variables).
- Terraform files live in `aws/` (see [aws/deploy.sh](../aws/deploy.sh)).
- An ECS cluster & service have been created by Terraform.

---

## 📁 Directory Structure

```
ansible/
├── ansible.cfg
├── inventory.ini
├── group\_vars/
│   └── all.yml
├── playbook.yml
└── roles/
├── terraform/
│   └── tasks/
│       └── main.yml
└── ecs\_deploy/
└── tasks/
└── main.yml
```

---

### ansible/ansible.cfg

```ini
[defaults]
inventory = inventory.ini
host_key_checking = False
retry_files_enabled = False
timeout = 30
forks = 10
```

---

### ansible/inventory.ini

```ini
[local]
localhost ansible_connection=local
```

---

### ansible/group_vars/all.yml

```yaml
---
# AWS region & environment
aws_region: us-east-1
environment: dev

# Path to Terraform folder
terraform_dir: ../aws

# ECR repo name (must match Terraform output)
ecr_repo_name: "{{ environment }}-metawave-repo"

# ECS cluster & service names
ecs_cluster_name: "metawave-{{ environment }}-cluster"
ecs_service_name: "metawave-{{ environment }}-service"

# Docker image tag (override via --extra-vars)
app_image_tag: latest
```

---

### ansible/playbook.yml

```yaml
---
- name: MetaWave Full Deploy
  hosts: local
  gather_facts: false
  vars_prompt:
    - name: "app_image_tag"
      prompt: "Docker image tag to deploy"
      private: no
      default: "{{ app_image_tag }}"

  roles:
    - terraform
    - ecs_deploy
```

---

## 🔧 Role: terraform

**File:** `ansible/roles/terraform/tasks/main.yml`

```yaml
---
- name: Ensure Terraform is initialized
  community.general.terraform:
    project_path: "{{ terraform_dir }}"
    executable: terraform
    state: init

- name: Terraform plan
  community.general.terraform:
    project_path: "{{ terraform_dir }}"
    executable: terraform
    state: planned
    plan_file: tfplan
    vars:
      supabase_url: "{{ lookup('env','SUPABASE_URL') }}"
      supabase_anon_key: "{{ lookup('env','SUPABASE_ANON_KEY') }}"
      db_password: "{{ lookup('env','DB_PASSWORD') }}"
      app_image_tag: "{{ app_image_tag }}"

- name: Terraform apply
  community.general.terraform:
    project_path: "{{ terraform_dir }}"
    executable: terraform
    state: applied
    plan_file: tfplan
```

> **Requirements**
>
> ```bash
> ansible-galaxy collection install community.general
> ```

---

## 🚢 Role: ecs_deploy

**File:** `ansible/roles/ecs_deploy/tasks/main.yml`

```yaml
---
- name: Build and push Docker image
  block:
    - name: Retrieve AWS account ID
      aws_sts:
        region: "{{ aws_region }}"
        profile: "{{ lookup('env','AWS_PROFILE') | default(omit) }}"
      register: sts

    - set_fact:
        account_id: "{{ sts.sts_creds.account }}"

    - name: Ensure ECR repo exists
      amazon.aws.ecr:
        region: "{{ aws_region }}"
        name: "{{ ecr_repo_name }}"
        state: present

    - name: Login to ECR
      community.docker.docker_login:
        registry_url: "{{ account_id }}.dkr.ecr.{{ aws_region }}.amazonaws.com"
        reauthorize: yes

    - name: Build Docker image
      community.docker.docker_image:
        build:
          path: "../" # Dockerfile at repo root
        name: "{{ account_id }}.dkr.ecr.{{ aws_region }}.amazonaws.com/{{ ecr_repo_name }}"
        tag: "{{ app_image_tag }}"

    - name: Push Docker image
      community.docker.docker_image:
        name: "{{ account_id }}.dkr.ecr.{{ aws_region }}.amazonaws.com/{{ ecr_repo_name }}"
        tag: "{{ app_image_tag }}"
        push: yes

- name: Update ECS service to new image
  amazon.aws.ecs_service:
    cluster: "{{ ecs_cluster_name }}"
    service: "{{ ecs_service_name }}"
    desired_count: 2
    task_definition:
      family: "metawave-task-{{ environment }}"
      container_definitions:
        - name: app
          image: "{{ account_id }}.dkr.ecr.{{ aws_region }}.amazonaws.com/{{ ecr_repo_name }}:{{ app_image_tag }}"
          essential: true
          portMappings:
            - containerPort: 3000
              hostPort: 3000
          environment:
            - name: SUPABASE_URL
              value: "{{ lookup('env','SUPABASE_URL') }}"
            - name: SUPABASE_ANON_KEY
              value: "{{ lookup('env','SUPABASE_ANON_KEY') }}"
    region: "{{ aws_region }}"
    force_new_deployment: true
```

> **Requirements**
>
> ```bash
> ansible-galaxy collection install amazon.aws
> ansible-galaxy collection install community.docker
> ```

---

## 🚀 Usage

1. **Install required collections**

   ```bash
   ansible-galaxy collection install community.general amazon.aws community.docker
   ```

2. **Configure credentials / vars**

- Populate `ansible/group_vars/all.yml` (or export via env).

3. **Run the playbook**

   ```bash
   cd ansible
   ansible-playbook playbook.yml -e "app_image_tag=latest"
   ```

This will:

1. Run `terraform init`, `plan`, and `apply` against your `aws/` folder.
2. Build & push your Next.js Docker image to ECR.
3. Update the existing ECS service for a rolling deployment.

Feel free to adjust instance counts, ports, secrets or add extra roles (e.g. RDS snapshots, CloudFront invalidation) as your infrastructure grows.
