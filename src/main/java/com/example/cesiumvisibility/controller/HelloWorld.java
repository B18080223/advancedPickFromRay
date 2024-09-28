package com.example.cesiumvisibility.controller;


import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

@CrossOrigin
@SpringBootApplication(scanBasePackages="com.example.cesiumviewability")
@Controller
public class HelloWorld {
    @RequestMapping("/Cesium")
//  public String helloWorld(HttpServletResponse response) {
//      response.addHeader("Access-Allow-Control-Origin","*");
//      response.addHeader("Access-Control-Allow-Method","POST,GET");//允许访问的方式
//      return "Cesium";
//  }
    public String helloWorld(){
        return "Cesium";
    }

}
