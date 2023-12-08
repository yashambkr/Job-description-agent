const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI(openaiApiKey);
const API_KEY_HEADER = process.env.API_KEY_HEADER;

const app = express();
app.use(bodyParser.json());

const model = 'gpt-3.5-turbo';

app.post('/generate_job_description', async (req, res) => {
  try {
    // // Auth check
    // const authHeader = req.headers.authorization;
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({ error: 'Missing or invalid authorization header' });
    // }

    // const token = authHeader.split(' ')[1];
    // if (token !== API_KEY_HEADER) {
    //   return res.status(401).json({ error: 'Invalid API key' });
    // }

    // Data validation
    const data = req.body;
    const requiredFields = ['company', 'job_title', 'job_type', 'location', 'experience', 'tags'];
    const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const { company, job_title, job_type, location, experience, tags } = data;

    // Prepare prompt
    const prompt = `
## Job Description

| Field | Value |
|---|---|
| Company | ${company} |
| Job Title | ${job_title} |
| Job Type | ${job_type} |
| Location | ${location} |
| Experience | ${experience} |

**Tags:**
- ${tags.join(', ')}

**Description:**

[Write a compelling job description for the position above. Be sure to highlight the required skills and experience, as well as the benefits of working for your company.]`;

    // Generate job description with OpenAI
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'system', content: prompt }],
    });

    // Extract job description
    const jobDescription = response.choices[0].message.content;

    // Return response
    res.json({ job_description: jobDescription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server is listening on port 3000'));
