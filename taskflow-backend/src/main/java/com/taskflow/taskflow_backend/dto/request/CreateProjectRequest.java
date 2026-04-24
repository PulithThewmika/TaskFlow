package com.taskflow.taskflow_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    private String colorTag;

    // Constructors
    public CreateProjectRequest() {}

    public CreateProjectRequest(String name, String description, String colorTag) {
        this.name = name;
        this.description = description;
        this.colorTag = colorTag;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getColorTag() { return colorTag; }
    public void setColorTag(String colorTag) { this.colorTag = colorTag; }
}
