package com.example.parcinfo.dto;

public class MessageResponse {
    private String message;
    private boolean success;
    private int status;

    public MessageResponse(String message, boolean success, int status) {
        this.message = message;
        this.success = success;
        this.status = status;
    }

    // Getters et Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
}