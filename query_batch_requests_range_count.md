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

***

The issue is that Oracle uses different syntax for timestamp arithmetic. In Oracle, you don't need `EXTRACT(EPOCH FROM ...)` for timestamp differences. Here's the corrected query:

```sql
WITH batch_sizes AS (
    SELECT 
        br.STMT_RQST_SEQ_NB,
        br.STMT_RQST_TS,
        br.STMT_RQST_CMPL_TS,
        COUNT(ba.ACCT_NB) as stmt_count,
        EXTRACT(DAY FROM (br.STMT_RQST_CMPL_TS - br.STMT_RQST_TS)) * 86400 + 
        EXTRACT(HOUR FROM (br.STMT_RQST_CMPL_TS - br.STMT_RQST_TS)) * 3600 + 
        EXTRACT(MINUTE FROM (br.STMT_RQST_CMPL_TS - br.STMT_RQST_TS)) * 60 + 
        EXTRACT(SECOND FROM (br.STMT_RQST_CMPL_TS - br.STMT_RQST_TS)) as completion_time_seconds
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

In Oracle, when you subtract two timestamps, you get an INTERVAL data type. To convert this to seconds, we extract each component (days, hours, minutes, seconds) and convert them all to seconds using the appropriate multipliers:
- Days × 86400 (seconds in a day)
- Hours × 3600 (seconds in an hour) 
- Minutes × 60 (seconds in a minute)
- Plus the seconds component

This should resolve the syntax error.

***

Here's the SQL query to count statement accounts where the completion timestamp is null (incomplete batch requests):

```sql
SELECT COUNT(ba.BAT_RQST_ACCT_SEQ_ID) as incomplete_statement_count
FROM STMT_BATCH_REQUEST br
INNER JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
WHERE br.STMT_RQST_CMPL_TS IS NULL;
```

This query:
- Joins the parent table (STMT_BATCH_REQUEST) with the child table (STMT_BATCH_RQST_ACCT)
- Filters for batch requests where the completion timestamp is null
- Counts all the individual statement accounts that belong to those incomplete batch requests

If you want to see additional details about these incomplete requests, you could also run:

```sql
SELECT 
    br.STMT_RQST_SEQ_NB,
    br.STMT_RQST_TS,
    br.USR_ID,
    COUNT(ba.ACCT_NB) as statement_count
FROM STMT_BATCH_REQUEST br
INNER JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
WHERE br.STMT_RQST_CMPL_TS IS NULL
GROUP BY br.STMT_RQST_SEQ_NB, br.STMT_RQST_TS, br.USR_ID
ORDER BY br.STMT_RQST_TS DESC;
```



***



Good catch! There are several possible reasons why the counts don't match:

## 1. **Orphaned Batch Requests (Most Likely)**
Some batch requests in `STMT_BATCH_REQUEST` might not have any corresponding records in `STMT_BATCH_RQST_ACCT`:

```sql
-- Count of incomplete batch requests
SELECT COUNT(*) as incomplete_batch_requests
FROM STMT_BATCH_REQUEST 
WHERE STMT_RQST_CMPL_TS IS NULL;

-- Count of incomplete batch requests that actually have statement accounts
SELECT COUNT(DISTINCT br.STMT_RQST_SEQ_NB) as incomplete_batches_with_statements
FROM STMT_BATCH_REQUEST br
INNER JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
WHERE br.STMT_RQST_CMPL_TS IS NULL;
```

## 2. **Check for Orphaned Batch Requests**
```sql
-- Find batch requests with no statement accounts
SELECT br.STMT_RQST_SEQ_NB, br.STMT_RQST_TS, br.USR_ID
FROM STMT_BATCH_REQUEST br
LEFT JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
WHERE br.STMT_RQST_CMPL_TS IS NULL 
AND ba.STMT_RQST_SEQ_NB IS NULL;
```

## 3. **Comprehensive Comparison**
```sql
-- All incomplete batches breakdown
SELECT 
    'Total Incomplete Batches' as category,
    COUNT(*) as count
FROM STMT_BATCH_REQUEST 
WHERE STMT_RQST_CMPL_TS IS NULL

UNION ALL

SELECT 
    'Incomplete Batches with Statements' as category,
    COUNT(DISTINCT br.STMT_RQST_SEQ_NB) as count
FROM STMT_BATCH_REQUEST br
INNER JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
WHERE br.STMT_RQST_CMPL_TS IS NULL

UNION ALL

SELECT 
    'Incomplete Statement Accounts' as category,
    COUNT(ba.BAT_RQST_ACCT_SEQ_ID) as count
FROM STMT_BATCH_REQUEST br
INNER JOIN STMT_BATCH_RQST_ACCT ba ON br.STMT_RQST_SEQ_NB = ba.STMT_RQST_SEQ_NB
WHERE br.STMT_RQST_CMPL_TS IS NULL;
```

**Most likely scenario**: Some batch requests were created but never had any statement accounts added to them (perhaps due to validation failures, user cancellation, or system errors during the request setup process).

Run these queries to identify the exact discrepancy!


