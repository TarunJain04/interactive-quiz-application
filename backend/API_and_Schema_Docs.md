API and Schema Docs (inferred from src/main/java/com/example/quiz/service/QuizService.java)

NOTE: These details are inferred from the service layer (QuizService.java). Exact controller paths, DTO field names, and exception handling should be verified against controller classes, DTOs (com.example.quiz.dto.*), model classes (com.example.quiz.model.*), and any @ControllerAdvice in the backend.

1) REST API endpoints (inferred)

- GET /api/questions
  - Description: list/search questions with filters and pagination (backed by Pageable)
  - Query params: category (string), type (enum), difficulty (enum), page (int), size (int), sort (string)
  - Request body: none
  - Response: Page<QuestionResponse>
    JSON example:
    {
      "content": [
        {
          "id": "64a0...",
          "question": "What is ...?",
          "choices": ["A","B","C","D"],
          "categoryName": "General Knowledge",
          "categorySlug": "general-knowledge",
          "type": "MULTIPLE_CHOICE",
          "difficulty": "EASY",
          "source": "OPENTDB"
        }
      ],
      "pageable": {"pageNumber":0,"pageSize":20},
      "totalElements": 123,
      "totalPages": 7,
      "last": false
    }

- GET /api/questions/{id}
  - Description: fetch a single question by id
  - Response: QuestionResponse (see fields above). May include full metadata.

- POST /api/questions
  - Description: add one question
  - Request body: QuestionRequest (inferred fields: question text, choices[], answerIndex, categoryName, type, difficulty, source)
  - Response: saved Question object (includes id)

- POST /api/questions/bulk
  - Description: add many questions
  - Request body: array of QuestionRequest
  - Response: array of saved Question objects

- POST /api/questions/import/open-trivia?amount=&category=&type=&difficulty=&verbose=
  - Description: load from OpenTDB via OpenTDBLoader
  - Query params: amount (int), category (int), type (string), difficulty (string), verbose (bool)
  - Response: ApiResults {requested, fetched, inserted, insertedItems?}

- POST /api/questions/import/quizapi and /api/questions/import/triviaapi
  - Similar to above for respective loaders (QuizApiLoader, TriviaApiLoader)

- POST /api/questions/{id}/check or POST /api/questions/{id}/answer
  - Description: check a user's answer index against stored answerIndex
  - Request body: { "answerIndex": number } OR query param answerIndex
  - Response (from checkAnswer):
    Success (correct): { "correct": true, "answerIndex": 2 }
    Incorrect: { "correct": false, "answerIndex": 1, "correctAnswerIndex": 3 }

- DELETE /api/questions/{id}
  - Deletes a single question by id
  - Response: 204 No Content or CountResponse

- DELETE /api/questions (with filters)
  - Query params: category, difficulty, type, source — requires at least one filter
  - Response: CountResponse: { "count": <deletedCount> }

- PATCH /api/questions (bulk update)
  - Query params: category, difficulty, type, source — filters to match
  - Request body: QuestionPatch (fields to change: category, difficulty, type, source)
  - Response: { "matched": <n>, "modified": <m> }

- GET /api/questions/sample
  - Query params: category, type, difficulty, size (int)
  - Response: List<QuestionResponse> (random sample)

- GET /api/filters
  - Response: Filters object: categories[], difficulties[], types[], sources[]

- GET /api/facets
  - Response: Facets (counts by category, byType, byDifficulty, bySource, total)

- GET /api/count (or /api/questions/count)
  - Query params same as countByFilters
  - Response: CountResponse { "count": <n> }


2) MongoDB document schemas/models (inferred)

Collection: questions (Question document)
Fields (inferred):
- _id: string (ObjectId or string) // question.id()
- question: string
- choices: array[string]
- answerIndex: int
- categoryName: string
- categorySlug: string
- type: string (enum) // maps to QuestionType
- difficulty: string (enum) // maps to Difficulty
- source: string (enum) // maps to Source
- createdAt: date? (not shown but common)
- updatedAt: date? (not shown)
- any loader/original fields: e.g., externalId, raw (optional)

Type examples:
{
  "_id": "64a0...",
  "question": "Which planet is closest to the Sun?",
  "choices": ["Mercury","Venus","Earth","Mars"],
  "answerIndex": 0,
  "categoryName": "Astronomy",
  "categorySlug": "astronomy",
  "type": "MULTIPLE_CHOICE",
  "difficulty": "EASY",
  "source": "OPENTDB"
}

Other small DTOs/models inferred:
- Category { name: string, slug: string }
- Filters { categories: Category[], difficulties: Difficulty[], types: QuestionType[], sources: Source[] }
- Facets { byCategory: Map<string,long>, byDifficulty: Map<Difficulty,long>, byType: Map<QuestionType,long>, bySource: Map<Source,long>, total: long }
- ApiResults { requested: int, fetched: int, inserted: int, insertedItems?: Question[] }
- CountResponse { count: long }
- QuestionPatch { category?: string, difficulty?: Difficulty, type?: QuestionType, source?: Source }


3) CORS-allowed origins and headers configured

- Not present in QuizService.java. No CORS configuration visible here.
- Action: check for @CrossOrigin on controllers or a WebMvcConfigurer/CorsFilter bean in the codebase (search for @CrossOrigin or add a CORS config).
- If no config exists, browsers will block cross-origin requests; recommended dev setting: Vite proxy to avoid CORS, and for production add server-side CORS allowing origins you trust (e.g., https://your-frontend-domain.com).

Example Spring config (if needed):
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
           .allowedOrigins("http://localhost:5173")
           .allowedMethods("GET","POST","PUT","PATCH","DELETE")
           .allowedHeaders("*");
  }
}


4) /api/questions endpoint in detail (inferred)

Query params:
- category (string) — human-readable name; service uses Slugifier.slugify(category) to match categorySlug
- type (enum string) — values match QuestionType (e.g., MULTIPLE_CHOICE, TRUE_FALSE)
- difficulty (enum string) — Difficulty enum values (EASY, MEDIUM, HARD)
- page (int) — Spring Pageable page number (0-based)
- size (int) — page size
- sort — Spring sort param (e.g., createdAt,asc)

Behavior:
- Builds a Query with optional criteria: categorySlug, type, difficulty
- Uses Pageable for offset/limit
- Returns a PageImpl<QuestionResponse> with total count from mongoTemplate.count

Exact response JSON (example):
{
  "content": [
    {
      "id": "64a0...",
      "question": "Sample?",
      "choices": ["A","B","C","D"],
      "categoryName": "General Knowledge",
      "categorySlug": "general-knowledge",
      "type": "MULTIPLE_CHOICE",
      "difficulty": "MEDIUM",
      "source": "QUIZAPI"
    }
  ],
  "pageable": {"pageNumber":0,"pageSize":10},
  "totalElements": 42,
  "totalPages": 5,
  "last": false
}

Notes/assumptions:
- QuestionResponse fields are inferred from service usage and typical DTO naming.
- The returned QuestionResponse likely excludes the correct answer index for listing endpoints (to avoid exposing answers). Verify DTOs.


5) Quiz submit / answer-check endpoint in detail

Available method: QuizService.checkAnswer(String id, int answerIndex)
- Probable endpoint: POST /api/questions/{id}/answer
- Request body example:
  { "answerIndex": 2 }
- Response examples:
  Correct:
  { "correct": true, "answerIndex": 2 }

  Incorrect:
  { "correct": false, "answerIndex": 1, "correctAnswerIndex": 3 }

Scoring logic:
- Single-question check: compares provided answerIndex to stored question.answerIndex (exact equality). No partial scoring visible.
- For multi-question quiz submit endpoint (not in service), recommend sending array of {questionId, answerIndex} and server responds with detailed per-question results and aggregate score; implement server-side if required.

Suggested multi-submit response shape:
{
  "results": [ { "questionId": "64a..", "correct": true, "given": 1, "correctAnswerIndex": 1 } ],
  "score": { "correct": 5, "total": 10, "percent": 50 }
}


6) Error response formats / status codes (inferred)

Exceptions referenced in service:
- QuestionNotFoundException -> likely maps to 404 Not Found
- InvalidAnswerException -> likely 400 Bad Request
- InvalidFilterException -> likely 400 Bad Request

If a @ControllerAdvice/ExceptionHandler is present, shape might be:
{ "timestamp": "...", "status": 404, "error": "Not Found", "message": "No question exists with id ...", "path": "/api/questions/.." }

If no global handler exists: Spring default will return status codes and default error JSON. Verify presence of an exception handler for consistent client responses.


7) Authentication mechanism

- No evidence of authentication (JWT or sessions) in QuizService.java.
- If auth is planned, check security config (WebSecurityConfigurerAdapter, SecurityFilterChain) or presence of JWT filters.
- If you want JWT: typical flow:
  - Client includes Authorization: Bearer <token>
  - Server validates token (HS256 or RS256), token payload may include sub (user id), roles, exp


Recommendations / Next steps for frontend work

- Confirm controller paths and DTO shapes by opening controller and DTO classes. The frontend TypeScript types should mirror QuestionRequest, QuestionResponse, Filters, Facets, ApiResults, CountResponse, QuestionPatch.
- If DTOs are numerous, generate OpenAPI from the backend and run openapi-generator or use quick manual TypeScript typings.
- Implement /api proxy in Vite for dev to avoid CORS, or enable CORS in backend.
- Implement typed API client (axios + TypeScript interfaces) and a checkAnswer wrapper matching the responses above.


If you want, next action: create frontend/ TypeScript interfaces for these inferred DTOs and a typed axios client file (frontend/src/api/api.ts). Confirm and I will generate the files (TS types + API client + example React hook).