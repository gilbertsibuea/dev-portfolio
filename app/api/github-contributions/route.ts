import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'gilbertsibuea';

    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    // console.log('Fetching GitHub contributions for:', username);
    // console.log('Using token:', process.env.NEXT_PUBLIC_GITHUB_TOKEN ? 'Token exists' : 'No token found');

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitHubContributions/1.0',
      },
      body: JSON.stringify({
        query,
        variables: { username }
      })
    });

    if (!response.ok) {
      console.error('GitHub API response not ok:', response.status, response.statusText);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('GitHub API response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('GitHub API errors:', data.errors);
      return NextResponse.json(
        { success: false, error: data.errors[0].message },
        { status: 400 }
      );
    }

    // Check if user data exists
    if (!data.data || !data.data.user) {
      return NextResponse.json(
        { success: false, error: `User ${username} not found` },
        { status: 404 }
      );
    }

    const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar;

    return NextResponse.json({
      success: true,
      totalContributions: contributionCalendar.totalContributions,
      weeks: contributionCalendar.weeks
    });

  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch contributions' 
      },
      { status: 500 }
    );
  }
}