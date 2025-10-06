# 🎯 Header UI Requirements

## 📋 **Unified Header Experience**

### **When User is SIGNED OUT:**
- **Header Content:**
  - Logo: "homeupgrades.ai" (left side)
  - **Sign In Button**: Outlined style, opens authentication modal
  - **Sign Up Button**: Filled style (primary), opens authentication modal
  - No other navigation elements

- **Button Styling (Reference Image):**
  - Both buttons are pill-shaped with rounded corners
  - Sign In: Transparent background with light outline
  - Sign Up: Solid light background (primary action)

### **When User is SIGNED IN:**
- **Header Content:**
  - Logo: "homeupgrades.ai" (left side)
  - **3 Navigation Tabs**: Homes | My Images | About
  - **User Avatar**: Circle with user initials (right side)
  - **User Dropdown**: Shows "Sign Out" option when clicked

- **User Avatar:**
  - Circular design with user's initials (e.g., "JE" for Jeremy Eletto)
  - Shows user's first and last name initials from Gmail
  - Dropdown menu with "Sign Out" option

### **Issues to Fix:**
1. ❌ Sign In button still shows when user is logged in
2. ❌ Duplicate "My Images" links (header + dropdown)
3. ❌ Shows "User" instead of actual user name from Gmail
4. ❌ Shows "User" button when signed out

### **Implementation Requirements:**
- Apply consistent header across ALL pages (index.html, homes.html, my-images.html)
- Remove all duplicate navigation elements
- Ensure proper authentication state detection
- Use Gmail profile data for user initials and name display

---
*Last Updated: January 2025*
