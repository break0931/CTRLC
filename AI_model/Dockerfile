# Step 1: Use an official Python runtime as a parent image
FROM python:3.10

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the requirements.txt file into the container
COPY requirements.txt .

# Step 4: Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the application code into the container
COPY . .

# Step 6: Expose port if needed (optional, depending on how you communicate)
EXPOSE 5555 


# Step 7: Set the default command to run your script
CMD ["python", "sendsignal2.py"]
