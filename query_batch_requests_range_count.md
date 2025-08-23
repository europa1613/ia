Here's the updated query with completion times in seconds:

```sql
WITH batch_sizes AS (
    SELECT 
        br.STMT_RQST_SEQ_NB,
        br.STMT_RQST_TS,
        br.STMT_RQST_CMPL_TS,
        COUNT(ba.ACCT_NB) as stmt_count,
        EXTRACT(EPOCH FROM (br.STMT_RQST_CMPL_TS - br.STMT_RQST_TS)) as completion_time_seconds
    FROM STMT_BATCH_REQUEST br
    LEFT JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
    WHERE br.STMT_RQST_CMPL_TS IS NOT NULL  -- Only completed requests
    GROUP BY br.STMT_RQST_SEQ_NB, br.STMT_RQST_TS, br.STMT_RQST_CMPL_TS
),
categorized_batches AS (
    SELECT 
        CASE 
            WHEN stmt_count < 10 THEN '< 10 statements'
            WHEN stmt_count < 25 THEN '10-24 statements'
            WHEN stmt_count < 50 THEN '25-49 statements'
            WHEN stmt_count < 100 THEN '50-99 statements'
            WHEN stmt_count < 250 THEN '100-249 statements'
            WHEN stmt_count < 500 THEN '250-499 statements'
            WHEN stmt_count < 1000 THEN '500-999 statements'
            ELSE '1000+ statements'
        END as statement_range,
        completion_time_seconds
    FROM batch_sizes
)
SELECT 
    statement_range,
    COUNT(*) as number_of_requests,
    ROUND(AVG(completion_time_seconds), 2) as avg_completion_time_seconds
FROM categorized_batches
GROUP BY statement_range
ORDER BY 
    CASE statement_range
        WHEN '< 10 statements' THEN 1
        WHEN '10-24 statements' THEN 2
        WHEN '25-49 statements' THEN 3
        WHEN '50-99 statements' THEN 4
        WHEN '100-249 statements' THEN 5
        WHEN '250-499 statements' THEN 6
        WHEN '500-999 statements' THEN 7
        WHEN '1000+ statements' THEN 8
    END;
```

The changes:
- Removed the division by 60 in the completion time calculation
- Changed variable name from `completion_time_minutes` to `completion_time_seconds`
- Updated the final column alias to `avg_completion_time_seconds`

Now the results will show average completion times in seconds instead of minutes.
