# Scaling

## Current Shape

The platform is built for a single VPS running Docker Compose. This keeps operations simple while the product is still compact.

## Bottlenecks To Watch

| Area | Risk | Response |
| --- | --- | --- |
| API | CPU or request latency | Run more API containers behind Nginx. |
| Web | Page render pressure | Scale Next.js containers separately. |
| Database | Slow queries or locks | Add indexes, tune queries, move to managed Postgres. |
| Redis | Cache misses or memory pressure | Set TTLs, monitor memory, move to managed Redis. |
| Executor | Code submission bursts | Scale executor and Judge0 workers. |
| Storage | Large media growth | Keep files in S3-compatible storage, not containers. |
| Email | Delivery limits | Use provider quotas and retry strategy. |

## Keep Simple Until Needed

Do not add queues, Kubernetes, or microservices unless traffic or reliability data asks for them.

## Scaling Order

1. Fix slow queries and missing indexes.
2. Cache public course/challenge reads.
3. Scale API and web containers separately.
4. Scale executor and Judge0 workers for challenge bursts.
5. Move PostgreSQL and Redis to managed services.
6. Add queues for email, payments, certificates, and scoring.
7. Consider orchestration only when Compose becomes the bottleneck.
