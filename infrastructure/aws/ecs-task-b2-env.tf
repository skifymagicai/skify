resource "aws_ecs_task_definition" "skify" {
  family                   = "skify-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "<backend-image-url>"
      essential = true
      portMappings = [{ containerPort = 4000 }]
      environment = [
        { name = "S3_ENDPOINT", value = var.b2_endpoint },
        { name = "S3_ACCESS_KEY", value = var.b2_key_id },
        { name = "S3_SECRET_KEY", value = var.b2_app_key },
        { name = "S3_BUCKET", value = var.b2_bucket },
        # ...other backend env vars...
      ]
    },
    {
      name      = "frontend"
      image     = "<frontend-image-url>"
      essential = true
      portMappings = [{ containerPort = 5173 }]
      environment = [
        { name = "VITE_API_URL", value = "http://localhost:4000" },
        { name = "S3_ENDPOINT", value = var.b2_endpoint },
        { name = "S3_ACCESS_KEY", value = var.b2_key_id },
        { name = "S3_SECRET_KEY", value = var.b2_app_key },
        { name = "S3_BUCKET", value = var.b2_bucket },
        # ...other frontend env vars...
      ]
    }
  ])
}
