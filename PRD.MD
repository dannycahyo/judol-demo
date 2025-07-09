**Product Requirements Document: "Responsible Gambling Simulator" (Educational Demo)**

**1. Introduction**

This document outlines the product requirements for the "Responsible Gambling Simulator," a single-page application (SPA) designed as an educational demo. The primary goal is to inform users about the mechanics of slot machines, highlighting concepts like random chance and payout percentages. It also includes a hidden administrative feature to demonstrate how game outcomes can be controlled, reinforcing the educational message. This application will not involve real money, and there will be no user login required.

**2. Vision & Goal**

Our vision is to create a simple, interactive educational tool that demystifies how online slots work. By simulating the game and revealing a hidden control panel, we aim to:

- **Educate users** on core concepts like Random Number Generators (RNG) and Return to Player (RTP).
- **Demonstrate the lack of user control** in games of pure chance.
- **Create a powerful "reveal"** for presentations by showing how outcomes can be centrally manipulated, prompting discussion about trust and system fairness.
- **Provide a safe space** to understand slot mechanics without any financial risk.

**3. Target Audience**

- **Primary User (The Player):**
  - Young Adults (18-25), individuals curious about gambling, students in financial literacy classes.
- **Secondary User (The Presenter/Admin):**
  - Educators, counselors, and presenters using the tool to demonstrate concepts to an audience.

**4. Key Features & Functionalities**

**4.1. Core Application**

- **Single-Page Application (SPA):** The entire user experience is contained within a single loading page.
- **No Login/User Accounts:** Users can access the application immediately.

**4.2. Simulated Game: Slots Simulation**

- **UI:** A clean, classic three-reel slot machine interface. It will display the user's virtual balance, the current bet amount, and the last win amount.
- **Functionality:**
  - Users can adjust their bet amount using simple "+" and "-" controls.
  - A large, clear "Spin" button initiates the reel animation.
  - By default, the outcome will be randomly generated based on predefined probabilities (simulating an RNG).
  - Wins and losses are clearly communicated, and the virtual balance is updated instantly.
- **Educational Component:**
  - **"How it Works" Button:** A visible link explaining RNG and RTP.
  - **Payout Table:** Shows winning combinations and their payouts.

**4.3. Hidden Feature: Admin Control Panel**

This page will **not** be accessible via any visible navigation link in the main application. It is intended for use by a presenter.

- **Access Method:** The page will be accessible only by manually navigating to a specific URL route (e.g., `[your-app-url]/admin`).
- **UI:** A simple control panel interface, separate from the main game design.
- **Functionality:** The admin will have a set of controls to influence the outcome of the **next spin** on the main game page.
  - **Outcome Control:** A set of radio buttons with the following options:
    1.  **Normal RNG (Default):** The game operates based on its standard random algorithm.
    2.  **Force Win:** The next spin is guaranteed to result in a winning combination. The app should select a pre-determined mid-tier win.
    3.  **Force Loss:** The next spin is guaranteed to result in a non-winning combination.
- **State Management:** The admin's selection will be stored in the browser's session storage. This choice will persist until the browser tab is closed or the admin selects a different option. After a forced spin occurs, the control should ideally revert to "Normal RNG" automatically to prevent accidental repeated forced outcomes.

**5. User Flows**

**5.1. Standard User Flow (The Player)**

1.  User lands on the application's main URL.
2.  The Slots Simulation interface loads immediately.
3.  The user plays the game normally, with outcomes determined by the default RNG.
4.  The user interacts with the educational content as desired.
5.  The session ends when the user closes the browser tab.

**5.2. Presenter/Admin Demonstration Flow**

1.  **Initial Experience:** The presenter lets the audience (or a volunteer) play the game for several spins to experience the normal, random outcomes. They can discuss the session stats (likely a net loss over time).
2.  **The Reveal:** The presenter discretely opens a new tab or navigates to the hidden `/admin` page on their machine. The audience does not need to see this page.
3.  **Set the Outcome:** The presenter selects "Force Win" on the admin panel.
4.  **Demonstrate Control:** The presenter returns to the main game page and invites the audience member to spin one more time. The spin results in a guaranteed win, surprising the audience.
5.  **Explain the Concept:** The presenter can then reveal the admin panel, explaining that while this is a demo, it illustrates that the user has no real control and that system operators do. This reinforces the educational message about trusting the system.

**6. UI/UX Considerations for the Frontend Engineer**

- **Admin Panel Simplicity:** The `/admin` page should be purely functional. No complex styling is needed. The focus is on clear, easy-to-use controls.
- **Seamless State Transition:** The application state must update seamlessly when an admin makes a selection. The main game UI should not give any indication that the outcome is being forced.
- **No Accidental Discovery:** Ensure no links or sitemap references point to the `/admin` route. It should be discoverable only by someone who knows the URL.

**7. Technology Stack (Recommendations)**

- **Routing:** A routing library with Next.js page router is now essential to manage the separate `/` and `/admin` pages.
- **State Management:** The global state using React Context must now include a property for the "outcome override" set by the admin panel (e.g., `outcome: 'RNG' | 'WIN' | 'LOSS'`). The game logic will check this state before running the RNG.

**8. Acceptance Criteria**

- All acceptance criteria from the previous version remain valid for the main game.
- Navigating to the `/admin` URL displays the Admin Control Panel.
- There are no visible links to the `/admin` page from the main application.
- Selecting "Force Win" on the admin panel causes the next spin in the main game to be a win.
- Selecting "Force Loss" on the admin panel causes the next spin in the main game to be a loss.
- After a forced spin, the outcome control reverts to "Normal RNG."
- The admin setting is cleared when the browser session ends.
